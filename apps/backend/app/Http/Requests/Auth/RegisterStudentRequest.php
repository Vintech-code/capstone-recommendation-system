<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Email;
use Illuminate\Validation\Rules\Password;

class RegisterStudentRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'firstName' => trim((string) $this->input('firstName')),
            'lastName' => trim((string) $this->input('lastName')),
            'email' => mb_strtolower(trim((string) $this->input('email'))),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'firstName' => ['required', 'string', 'max:100'],
            'lastName' => ['required', 'string', 'max:100'],
            'email' => [
                'required',
                Email::default()
                    ->strict()
                    ->preventSpoofing()
                    ->when(! app()->environment('testing'), fn (Email $rule): Email => $rule->validateMxRecord()),
                'max:255',
                'not_regex:/@gamil\.com\z/i',
                Rule::unique('users', 'email'),
                Rule::unique('administrator_invitations', 'pending_email'),
            ],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'email.not_regex' => 'Enter a valid email domain. Did you mean gmail.com?',
        ];
    }
}
