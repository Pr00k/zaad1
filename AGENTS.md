<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Keep user-visible Arabic and English wording in the shared translation dictionaries so labels stay consistent across pages.
- Add new default vaults through versioned local-store migrations with zero balance and zero allocation to preserve existing financial data and intentional deletions.
- Synchronize one validated financial snapshot per account with an atomic revision precondition; keep account caches and guest persistence separate to prevent partial financial updates and identity leaks.
- Record exact per-vault transaction allocations in hundredths so undo remains accurate after allocation changes.
- Read versioned persisted snapshots before applying store state; recover account-only snapshots conservatively when a sync cache is missing to avoid losing local money or reviving deleted defaults.
