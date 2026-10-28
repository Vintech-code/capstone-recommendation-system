<?php

namespace App\Http\Requests\Assessment;

use App\Services\Assessment\RiasecQuestionnaire;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SaveAssessmentSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, int|string>> */
    public function rules(): array
    {
        return [
            'answers' => ['required', 'array', 'max:'.RiasecQuestionnaire::QUESTION_COUNT],
            'answers.*' => ['required', 'integer', 'in:1,2'],
            'current_question' => ['required', 'integer', 'between:1,'.RiasecQuestionnaire::QUESTION_COUNT],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $answers = $this->input('answers', []);
            if (! is_array($answers)) {
                return;
            }

            foreach (array_keys($answers) as $question) {
                $index = filter_var($question, FILTER_VALIDATE_INT);
                if ($index === false || $index < 1 || $index > RiasecQuestionnaire::QUESTION_COUNT) {
                    $validator->errors()->add('answers', 'Answers must use question numbers from 1 through 42.');
                    break;
                }
            }
        }];
    }
}
