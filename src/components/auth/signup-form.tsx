'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { apiClient } from '@/lib/api'
import { SignupResponse } from '@/types/auth'
import { CheckCircle, Eye, EyeOff } from 'lucide-react'

interface SignupFormData {
  username: string
  password: string
  confirmPassword: string
  name: string
}

export function SignupForm() {
  const [formData, setFormData] = useState<SignupFormData>({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required')
      return false
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long')
      return false
    }
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const response = await apiClient.post<SignupResponse>('/api/sign-up', {
        username: formData.username.trim(),
        password: formData.password,
        name: formData.name.trim(),
      })

      if (response.status === 'success') {
        setSuccess(true)
        // Auto-redirect to login after 2 seconds
        setTimeout(() => {
          router.push(
            '/login?message=Account created successfully. Please sign in.'
          )
        }, 2000)
      } else {
        setError(response.error?.message || 'Account creation failed')
      }
    } catch (err) {
      console.error('Signup error:', err)
      if (err instanceof Error) {
        // Handle specific error messages from the API
        if (
          err.message.includes('already exists') ||
          err.message.includes('USER_CREATION_FAILED')
        ) {
          setError('Username already exists. Please choose a different one.')
        } else if (err.message.includes('INVALID_INPUT')) {
          setError('Please check your input and try again.')
        } else {
          // Try to parse error message if it's HTML or JSON
          try {
            const errorText = err.message
            if (errorText.includes('Cannot POST')) {
              setError(
                'Service temporarily unavailable. Please try again later.'
              )
            } else {
              setError('Account creation failed. Please try again.')
            }
          } catch {
            setError('Account creation failed. Please try again.')
          }
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange =
    (field: keyof SignupFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value })
      // Clear error when user starts typing
      if (error) setError('')
    }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-green-700">
                Account Created Successfully!
              </h3>
              <p className="text-sm text-muted-foreground">
                Welcome to MiloMCP Studio! You&apos;ll be redirected to the
                login page shortly.
              </p>
            </div>
            <Button onClick={() => router.push('/login')} className="w-full">
              Continue to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign up</CardTitle>
        <CardDescription className="text-center">
          Create your account to get started with MiloMCP Studio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleInputChange('username')}
              required
              disabled={loading}
              minLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                disabled={loading}
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                disabled={loading}
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </Button>

          <div className="text-xs text-center text-muted-foreground">
            By creating an account, you agree to our terms of service and
            privacy policy.
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
