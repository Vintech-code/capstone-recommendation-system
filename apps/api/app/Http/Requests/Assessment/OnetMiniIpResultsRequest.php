<?php

namespace App\Http\Requests\Assessment;

use App\Services\Onet\OnetInterestProfilerClient;
use Illuminate\Foundation\Http\FormRequest;

class OnetMiniIpResultsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, int|string>>
     */
    public function rules(): array
    {
        return [
            'answers' => [
                'required',
                'array',
                'list',
                'size:'.OnetInterestProfilerClient::QUESTION_COUNT,
            ],
            'answers.*' => ['required', 'integer', 'between:1,5'],
        ];
    }
}
