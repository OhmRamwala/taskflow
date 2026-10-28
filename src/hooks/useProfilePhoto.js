/**
 * useProfilePhoto
 * 
 * Custom hook for managing profile photo upload, preview, and persistence.
 * Stores photos as base64 data URLs in localStorage alongside the profile.
 */
import { useState, useCallback } from 'react'

const PROFILE_KEY = 'taskflow-profile'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export function useProfilePhoto() {
  const [error, setError] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // Get current photo from profile
  const getPhoto = useCallback(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY)
      if (!raw) return null
      const profile = JSON.parse(raw)
      return profile.photo || null
    } catch {
      return null
    }
  }, [])

  // Validate file
  const validateFile = useCallback((file) => {
    if (!file) {
      return 'No file selected'
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please select a valid image file (JPG, JPEG, PNG, or WEBP)'
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB'
    }

    return null
  }, [])

  // Convert file to base64
  const fileToBase64 = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }, [])

  // Upload photo
  const uploadPhoto = useCallback(async (file) => {
    setError(null)
    setIsUploading(true)

    try {
      // Validate
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        setIsUploading(false)
        return null
      }

      // Convert to base64
      const base64 = await fileToBase64(file)

      // Save to profile
      const raw = localStorage.getItem(PROFILE_KEY)
      const profile = raw ? JSON.parse(raw) : {}
      profile.photo = base64
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))

      setIsUploading(false)
      return base64
    } catch (err) {
      setError('Failed to upload photo. Please try again.')
      setIsUploading(false)
      return null
    }
  }, [validateFile, fileToBase64])

  // Remove photo
  const removePhoto = useCallback(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY)
      if (!raw) return

      const profile = JSON.parse(raw)
      delete profile.photo
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    } catch {
      // Silent fail
    }
  }, [])

  return {
    getPhoto,
    uploadPhoto,
    removePhoto,
    error,
    isUploading,
    clearError: () => setError(null),
  }
}
