# VAPI Error Debugging Guide

## Current Issue: Empty Error Object

The error `VAPI Error: {}` indicates that the VAPI SDK is emitting an error, but the error details are not being properly captured or serialized.

## Recent Improvements Made

1. **Enhanced Error Logging** in `Agent.tsx`:
   - The `onError` handler now extracts all properties from error objects
   - Handles cases where error is not a proper Error instance
   - Logs detailed error information to console

2. **Improved VAPI Initialization** in `lib/vapi.sdk.ts`:
   - Added validation for VAPI token
   - Added global error handler
   - Logs warning if token is not configured

3. **Better Call Start Error Handling**:
   - Added logging of call parameters
   - Detailed error extraction and logging

## Troubleshooting Steps

### Step 1: Check Environment Variables

```bash
# Verify these are set in your .env.local:
NEXT_PUBLIC_VAPI_WEB_TOKEN=<your-token>
NEXT_PUBLIC_VAPI_WORKFLOW_ID=<your-workflow-id>
```

### Step 2: Check Browser Console

When the error occurs, look for logs with this pattern:

- **"VAPI Error occurred:"** - Shows the actual error object with all properties
- **"Starting VAPI interview:"** - Shows what parameters were sent
- **"Starting VAPI workflow:"** - Shows workflow initialization

### Step 3: Common VAPI Error Causes

| Cause                           | Signs                                             | Solution                                             |
| ------------------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| Invalid API Token               | `401 Unauthorized` in console, empty error object | Verify token in .env.local                           |
| Workflow/Assistant ID not found | `404 Not Found` or empty error                    | Check workflow/assistant ID exists in VAPI dashboard |
| Network issue                   | Error occurs intermittently                       | Check browser DevTools Network tab                   |
| WebRTC/Audio permissions        | Browser can't access mic                          | Ensure user grants permissions                       |
| Daily.co connection failed      | Error from @daily-co/daily-js                     | Check Daily.co configuration                         |

### Step 4: Enable Debug Mode

Add this to your Agent.tsx useEffect to get more VAPI events:

```typescript
vapi.on("call-start", () => console.log("✓ Call started"));
vapi.on("call-end", () => console.log("✓ Call ended"));
vapi.on("speech-start", () => console.log("🎙️ User speaking"));
vapi.on("speech-end", () => console.log("🎙️ User stopped"));
vapi.on("message", (msg) => console.log("💬 Message:", msg));
```

### Step 5: Check VAPI Dashboard

1. Go to https://dashboard.vapi.ai
2. Verify your assistant/workflow exists
3. Check API token permissions
4. Review recent logs for error messages

### Step 6: Browser Console Analysis

```javascript
// Run this in browser console to check VAPI instance
Vapi?.getCall?.(); // Check if call is active
Vapi?.getState?.(); // Check VAPI state
```

## Next Steps to Identify Root Cause

1. **Restart your dev server** after making changes:

   ```bash
   npm run dev
   ```

2. **Clear `.next` cache and rebuild**:

   ```bash
   rm -r .next
   npm run build
   ```

3. **Check the browser console** (F12 → Console tab) for new detailed error logs

4. **Look for "VAPI Error occurred:" messages** with full error details

5. **Share the detailed error output** from console for further debugging

## Related Files

- Component: [components/Agent.tsx](components/Agent.tsx)
- VAPI SDK: [lib/vapi.sdk.ts](lib/vapi.sdk.ts)
- Chat Route: [app/api/chat/route.ts](app/api/chat/route.ts)
