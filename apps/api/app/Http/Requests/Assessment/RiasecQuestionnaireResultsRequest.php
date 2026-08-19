<?php

namespace App\Http\Requests\Assessment;

use App\Services\Assessment\RiasecQuestionnaire;
use Illuminate\Foundation\Http\FormRequest;

final class RiasecQuestionnaireResultsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, int|string>> */
    public function rules(): array
    {
        return [
            'answers' => ['required', 'array', 'list', 'size:'.RiasecQuestionnaire::QUESTION_COUNT],
            'answers.*' => ['required', 'integer', 'in:1,2'],
        ];
    }
}
