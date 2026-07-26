## Summary

Describe the user problem and the change.

## Trust boundary

Which boundary is affected?

- [ ] CV/job input validation
- [ ] Evidence extraction or matching
- [ ] Cover-letter/provider output
- [ ] Tracker approval or state changes
- [ ] Supabase persistence/RLS
- [ ] n8n automation
- [ ] Deployment/dependencies
- [ ] Documentation only

## Safety checklist

- [ ] Final claims remain traceable to CV evidence.
- [ ] Unsupported requirements remain blocked rather than invented.
- [ ] Provider or document text is treated as untrusted.
- [ ] Unexpected fields and invalid runtime values are rejected.
- [ ] No tracker state changes before explicit approval.
- [ ] No automated recruiter messaging or application submission was added.
- [ ] No secrets or real personal data were committed.

## Validation

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] Dependency scan reviewed

## Documentation and limitations

List documentation changes and any known limitations.
