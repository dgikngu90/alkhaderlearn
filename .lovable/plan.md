
What I found

- Your screenshot shows `DNS_PROBE_FINISHED_NXDOMAIN`.
- I checked the published URL and it currently resolves and returns the homepage.
- I also confirmed the project is published publicly.
- The last code diff in `VideoUploadForm.tsx` is not related to this problem.

Plan

1. Do not change React code for this specific issue yet.
   - A DNS error happens before the app loads, so code edits will not fix it.

2. Treat this as a domain/reachability issue first.
   - Re-test the published URL on:
     - mobile data
     - Wi‑Fi
     - another browser/incognito
   - Disable VPN, ad blocker, or Private DNS if enabled.
   - Restart the phone to clear cached DNS.

3. Re-publish the frontend once from the Publish dialog.
   - This ensures the latest frontend build is attached to the public URL.

4. If the `.lovable.app` URL still shows NXDOMAIN on multiple networks after re-publishing,
   - the next step is hosting/domain investigation, not app debugging.

Technical details

- `NXDOMAIN` means the browser could not resolve the domain name at all.
- That happens before any HTML, JavaScript, auth logic, or upload logic runs.
- So this is not caused by `src/components/VideoUploadForm.tsx`, login redirects, or dashboard code.
- Since the published URL resolves from my side, this is most likely:
  - temporary DNS propagation/caching, or
  - a device/network-specific resolver issue.

Recommended next move

- First re-publish and test the public URL from a second network/device.
- Only if it still fails everywhere should I investigate the deployment/domain layer further.
