<?php

namespace App\Http\Requests\Recommendation;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecommendationFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, int|string>> */
    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $comment = $this->input('comment');
        if (is_string($comment)) {
            $comment = trim($comment);
            $this->merge(['comment' => $comment !== '' ? $comment : null]);
        }
    }
}
