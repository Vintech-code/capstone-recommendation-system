<?php

namespace App\Http\Requests\Auth;

use App\Models\RoleSlug;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'portal' => ['required', 'string', Rule::enum(RoleSlug::class)],
        ];
    }

    public function role(): RoleSlug
    {
        return RoleSlug::from($this->string('portal')->toString());
    }
}
