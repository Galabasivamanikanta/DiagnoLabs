# TODO - Google login fix + OTP verification follow-up

- [x] Analyze frontend + backend Google login flow mismatch (auth-code code vs id_token)
- [x] Update `frontend/src/pages/Login.jsx` to send `tokenResponse.id_token` to backend `/api/auth/google`
- [x] Switch Google OAuth flow to `implicit` so `id_token` is available
- [x] Remove unused imports/vars in `frontend/src/pages/Login.jsx` to satisfy lint
- [ ] Run frontend build/start and ensure no runtime errors (build already succeeded earlier)
- [ ] Manually test Google login in browser and confirm redirect to `/patient/dashboard`
- [ ] OTP verification “kuda set cheyyi” fix:
  - [ ] Find OTP UI/flow in frontend (currently no obvious OTP pages in `frontend/src/pages`)
  - [ ] Wire frontend OTP verify to backend `/api/auth/verify-otp` & `/api/auth/send-otp` with correct payload { phone, email, otp }
  - [ ] Ensure OTP success updates `isVerified` and blocks/unblocks next steps correctly

