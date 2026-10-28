import { useEffect, useRef, useState } from "react";

import {
  AssessmentApiError,
  declareEntranceExaminationResult,
  getAssessmentQuestions,
  getCurrentAssessment,
  getEntranceExaminationResult,
  retryAssessmentResult,
  saveAssessment,
  startAssessment,
  submitAssessmentSession,
  type AssessmentLifecycle,
  type EntranceExaminationState,
} from "@/features/student/assessment/assessment-api";
import type {
  AssessmentConnectionState,
  AssessmentSaveState,
  AssessmentSessionLoadState,
  AssessmentView,
} from "@/features/student/assessment/assessment-session-types";
import type {
  AssessmentResponseValue,
  AssessmentSessionContent,
} from "@/features/student/assessment/assessment-types";
import {
  assessmentSessionStorageKey,
  getResponseOptionDescription,
  readStoredAnswers,
  waitForAssessmentResult,
} from "@/features/student/assessment/utils/assessment-session-utils";
import { getLatestRecommendation } from "@/features/student/recommendations/recommendation-api";
import { clearStudentResourceCache } from "@/features/student/student-resource-cache";

const autoAdvanceDelayMs = 260;

interface UseAssessmentSessionOptions {
  initialLoadState: AssessmentSessionLoadState;
  initialConnectionState: AssessmentConnectionState;
  remotePersistence: boolean;
  initialContent?: AssessmentSessionContent;
  onViewMatches?: () => void;
}

function useAssessmentSession({
  initialLoadState,
  initialConnectionState,
  remotePersistence,
  initialContent,
  onViewMatches,
}: UseAssessmentSessionOptions) {
  const [loadState, setLoadState] = useState<AssessmentSessionLoadState>(
    remotePersistence ? "loading" : initialContent ? initialLoadState : "empty",
  );
  const [connectionState, setConnectionState] = useState(initialConnectionState);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadError, setLoadError] = useState("Your saved responses were not changed. Try loading the session again.");
  const [answers, setAnswers] = useState(readStoredAnswers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saveState, setSaveState] = useState<AssessmentSaveState>(initialConnectionState === "offline" ? "saved-locally" : "saved");
  const [view, setView] = useState<AssessmentView>("questions");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [completedAssessment, setCompletedAssessment] = useState<AssessmentLifecycle | null>(null);
  const [retakeError, setRetakeError] = useState<string | null>(null);
  const [entranceExamination, setEntranceExamination] = useState<EntranceExaminationState | null>(null);
  const [content, setContent] = useState<AssessmentSessionContent>(initialContent ?? { id: "", versionReference: "", questions: [], responseOptions: [] });
  const saveTimer = useRef<number | undefined>(undefined);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const onViewMatchesRef = useRef(onViewMatches);
  const question = content.questions[currentIndex];
  const answeredCount = content.questions.filter((item) => answers[item.id]).length;

  useEffect(() => () => window.clearTimeout(saveTimer.current), []);
  useEffect(() => {
    onViewMatchesRef.current = onViewMatches;
  }, [onViewMatches]);

  useEffect(() => {
    if (!remotePersistence) return;
    let active = true;

    async function loadSession() {
      try {
        const examination = await getEntranceExaminationResult();
        if (!active) return;
        setEntranceExamination(examination);
        if (examination.status === "required") {
          setLoadState("ready");
          return;
        }
        const [questions, current] = await Promise.all([getAssessmentQuestions(), getCurrentAssessment()]);
        if (current.status === "result_available") {
          if (active) {
            setCompletedAssessment(current);
            setLoadState("ready");
            if (onViewMatchesRef.current) onViewMatchesRef.current();
            else setView("completed");
          }
          return;
        }
        const session = current.status === "not_started" ? await startAssessment() : current;
        if (!active) return;
        if (!session.id || questions.questions.length === 0 || questions.answer_options.length === 0) {
          setLoadState("empty");
          return;
        }
        setSessionId(session.id);
        setContent({
          id: session.reference ?? String(session.id),
          versionReference: questions.instrument.code,
          questions: questions.questions.map((item) => ({ id: `item-${String(item.index).padStart(2, "0")}`, prompt: item.text })),
          responseOptions: questions.answer_options.map((option) => ({
            value: option.value as AssessmentResponseValue,
            label: option.name,
            description: getResponseOptionDescription(option.name),
          })),
          source: questions.instrument.source ? { name: questions.instrument.source.name, url: questions.instrument.source.url } : undefined,
        });
        setAnswers(Object.fromEntries(Object.entries(session.answers ?? {}).map(([index, value]) => [`item-${String(index).padStart(2, "0")}`, value as AssessmentResponseValue])));
        setCurrentIndex(Math.max(0, (session.current_question ?? 1) - 1));
        setLoadState("ready");
      } catch (error: unknown) {
        if (!active) return;
        setLoadError(error instanceof AssessmentApiError ? error.message : "Your saved responses were not changed. Try loading the session again.");
        setLoadState("error");
      }
    }

    void loadSession();
    return () => {
      active = false;
    };
  }, [loadAttempt, remotePersistence]);

  async function persistAnswers(nextAnswers: Record<string, AssessmentResponseValue>, locally = connectionState === "offline", currentQuestion = currentIndex + 1): Promise<boolean> {
    try {
      window.localStorage.setItem(assessmentSessionStorageKey, JSON.stringify(nextAnswers));
      if (locally || !remotePersistence || !sessionId) {
        setSaveState(locally ? "saved-locally" : "saved");
        return true;
      }
      const serverAnswers = Object.fromEntries(Object.entries(nextAnswers).map(([id, value]) => [String(Number(id.replace("item-", ""))), value]));
      const saveRequest = saveQueue.current.catch(() => undefined).then(async () => {
        await saveAssessment(sessionId, serverAnswers, currentQuestion);
      });
      saveQueue.current = saveRequest.catch(() => undefined);
      await saveRequest;
      setSaveState("saved");
      return true;
    } catch {
      setSaveState(remotePersistence ? "saved-locally" : "unsaved");
      return false;
    }
  }

  function answerQuestion(value: AssessmentResponseValue) {
    if (!question) return;
    const nextAnswers = { ...answers, [question.id]: value };
    setAnswers(nextAnswers);
    setSaveState(connectionState === "offline" ? "saved-locally" : "saving");
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void persistAnswers(nextAnswers, undefined, currentIndex + 1), 250);
    if (currentIndex < content.questions.length - 1) {
      window.setTimeout(() => setCurrentIndex((index) => index + 1), autoAdvanceDelayMs);
    }
  }

  async function submitAssessment() {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = undefined;
    setSubmitError(null);
    setView("submitting");
    try {
      if (remotePersistence && sessionId) {
        if (!(await persistAnswers(answers))) throw new Error("Assessment answers could not be saved.");
        let submitted = await submitAssessmentSession(sessionId);
        if (submitted.status === "result_failed") submitted = await retryAssessmentResult(sessionId);
        if (submitted.status === "preparing_result") submitted = await waitForAssessmentResult();
        if (submitted.status !== "result_available") {
          setSubmitError("Your answers were saved, but result processing is still unavailable. Try again shortly.");
          setView("questions");
          return;
        }
        window.localStorage.removeItem(assessmentSessionStorageKey);
        setCompletedAssessment(submitted);
        clearStudentResourceCache();
        try { await getLatestRecommendation(); } catch { /* Prefetch failure does not block navigation. */ }
        if (onViewMatches) onViewMatches();
        else setView("completed");
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      window.localStorage.removeItem(assessmentSessionStorageKey);
      clearStudentResourceCache();
      if (onViewMatches) onViewMatches();
      else setView("completed");
    } catch {
      setSubmitError("Your assessment could not be submitted. Check your connection and try again.");
      setView("questions");
    }
  }

  function retryConnection() {
    setConnectionState("online");
    void persistAnswers(answers, false);
  }

  function retrySessionLoad() {
    if (!remotePersistence && initialContent) {
      setLoadState("ready");
      return;
    }
    setLoadState("loading");
    setLoadAttempt((value) => value + 1);
  }

  async function beginRetake(reason?: string) {
    setRetakeError(null);
    try {
      await startAssessment(reason);
      setCompletedAssessment(null);
      setView("questions");
      setLoadState("loading");
      setLoadAttempt((value) => value + 1);
    } catch (error) {
      setRetakeError(error instanceof AssessmentApiError ? error.message : "The retake could not be started. Try again.");
    }
  }

  async function declareEntranceResult(score: number) {
    setEntranceExamination(await declareEntranceExaminationResult(score));
    setLoadState("loading");
    setLoadAttempt((value) => value + 1);
  }

  return {
    answeredCount,
    answers,
    answerQuestion,
    beginRetake,
    completedAssessment,
    connectionState,
    content,
    currentIndex,
    declareEntranceResult,
    entranceExamination,
    loadError,
    loadState,
    question,
    retakeError,
    retryConnection,
    retrySessionLoad,
    saveState,
    setCurrentIndex,
    submitAssessment,
    submitError,
    view,
  };
}

export { useAssessmentSession };
