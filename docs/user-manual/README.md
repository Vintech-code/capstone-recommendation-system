# Local user and operator guide

## Student Applicant

1. Open `/` and use the Student sign-in or registration flow. Registration collects separate first and last names. For email/password registration, open the signed verification link sent to the submitted address before signing in; use **Resend verification email** if needed.
2. Complete the personal profile as needed.
3. Self-declare the entrance examination result before starting or continuing the assessment.
4. Answer all 42 binary RIASEC statements and finish the assessment. If a question was missed, use the numbered **You skipped** alert to jump directly to it. The final action changes to **Review n unanswered** until every statement has a response.
5. Review the recorded result, all ranked classified programmes, and the separately listed pending programme. For any ranked programme, answer **How well does this recommendation match your interests?** using the 1â€“5-star scale from **Does not match** to **Matches very well**, optionally add a comment about how the recommendation compares with your experience, and save it. Administrators can review the rating and comment without the Student name or account identifier, so do not include personal information in free text. The response can be edited later and does not change the recorded match or rank. Open the result card through **Share result**; the card scrolls inside the dialog on desktop and mobile. Select **Download card** to save the complete card as a PNG image. Administrators receive the same card and download behavior from the Student record.
6. Explore programme details, compare programmes, save options, and review assessment history.

Recommendations are guidance, not admission decisions or guarantees.

Every valid ordered three-letter result shows a unique two-word interest-profile name and two-sentence description on the result page and shareable result card. Eleven names are repository-owner-approved presentation overrides for the classified PSG-matrix profiles; the other 109 are derived from the ordered primary, secondary, and tertiary RIASEC meanings and do not classify additional programmes. These summaries describe vocational interests rather than personality, ability, expected success, admission, or institutional approval.

When scores tie, the result keeps higher score tiers ahead of lower tiers. Every tied primary or secondary area stays in the displayed code and is reordered only with areas from the same tier, so the result may contain four, five, or six letters. If the primary and secondary are already fixed, tied tertiary areas appear as separate alternative third letters. Variable-length results use their recorded area labels rather than inventing additional three-code profile names. Programme matching still compares all six stored scores with each programme's separate three-area profile.

When using **Continue with Google**, allow the separate Google sign-in window and choose the intended Student account from Google's account picker. Keep the original TCC course-recommendation tab open; it returns to the authenticated Student home after the separate window completes. A Google account already assigned to another portal cannot be used as a Student account.

The authenticated Student sections use protected URLs: `/student`, `/student/programmes`, `/student/matches`, `/student/profile`, and `/student/history`. Browser Back moves through previously opened Student sections and does not sign the Student out. Only use **Sign out** when the session should end. If the session has genuinely expired or has been revoked, the protected route returns to the Student sign-in flow.

## Administrator

1. Open `/admin/login` with an individually provisioned Administrator account.
2. Use Dashboard for truthful operational counts and recent Student evidence.
3. Use Students for server-filtered records and immutable assessment evidence.
4. Use Programmes to manage allowed enrichment fields and media, preview the shared catalogue draft, and publish deliberately.
5. Use Reports for aggregate, privacy-aware data, including verified COR enrollment alignment with each Student's Rank #1 recommendation. The summary shows how many verified enrollments match the top recommendation, while the table shows alternative programme counts for Students who enrolled elsewhere. These counts show observed alignment and do not prove that the recommendation caused the enrollment choice. Use Activity for sanitized audit history.
6. If your account has Administrator-management access, use Administrators to send a single-use setup invitation, review invitation state, suspend/reactivate accounts, manage account-management access, or revoke sessions. Confirm each sensitive action with your own password; never create or send another Administrator's password.

Administrators cannot alter completed Student answers, historical recommendations, protected CMO facts, entrance groups, or RIASEC profiles through the ordinary editor.

Student programme rankings continue to show every configured programme by recorded interest fit. If the entrance-exam result belongs to a different programme group, the row and detail page show a warning such as **Board programme · admission review needed**. The course remains at its exact rank, including a top-three position, because it still matches the Student's interests. The Student should check TCC admission requirements before choosing it. This warning is not a pass/fail judgment or an admission decision.

The separate **Feedback** page includes recommendation interest-match feedback beginning with the first saved response in the selected date range. Each Student contributes only their latest response for each programme. The table assigns temporary labels such as **Anonymous respondent #1**; select **View feedback** to open every relevant recorded result. Each result lists the complete programme ranking and recorded match, including programmes with **No feedback submitted**, while ratings and comments appear beside the programmes that received them. Respondent/result numbers apply only to the current filtered view and are not Student or assessment numbers. Student names and account identifiers are not shown, but free text may contain details entered by the Student and must be handled only for authorized review. Feedback describes perceived relevance and does not validate outcomes or change recommendation rankings. **System reports** remains focused on assessment and engagement metrics.

An already-provisioned active Administrator may also use **Continue with Google** in the separate sign-in window when the selected Google email exactly matches that Administrator account. Google sign-in does not create Administrators or grant the Administrator role. Google shows the account picker on every attempt so a previously rejected account can be changed.

## Password recovery

Use **Forgot password?** from the dedicated Student or Administrator sign-in page. For an active account, the system sends a time-limited reset link through the configured mail transport without revealing whether an entered address exists. A new password must contain 12 to 255 characters with uppercase and lowercase letters, a number, and a symbol. After a successful reset, continue through the same role portal used by the account; the reset also revokes its existing sessions.
