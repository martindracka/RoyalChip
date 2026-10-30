# AI usage & reflection

> Draft for the oral exam. Review it and add your own experience – you must be able to explain every point.

## Tools
- **Claude Code** (Anthropic, model Claude Opus 5.5) in VS Code – planning, code generation, refactoring,
  documentation, unit tests.

## What AI was mainly used for
- Proposing the project structure (views / components / composables / services / stores).
- Generating the first version of components, game logic and the Appwrite setup script.
- Writing unit tests for the pure game logic.
- Reviewing the UI with screenshots and fixing layout bugs.
- Drafting this documentation.

## Example: AI helped
**Shared betting logic.** All five games need the same steps: validate the bet, take the stake, pay out,
update statistics and save the bet. The AI suggested putting this into one composable (`useBet.js`) so each
game component only contains its own rules and animation. This removed a lot of duplicated code and made
the game components short.

## Examples: AI suggestions that had to be corrected
1. **Outdated Appwrite API.** The usual examples use `Databases` with *collections/documents*
   (`createDocument`, `listDocuments`). In the installed SDK version these are deprecated in favour of
   **TablesDB** (*tables/rows*: `createRow`, `listRows`). The SDK's type definitions had to be checked and the
   code adapted.
2. **Default permissions.** The first version of `createProfile` gave every user read permission on the row
   *and* on the table – duplicated and confusing. It was simplified. It was also important to always pass
   permissions when creating bets: without them Appwrite gives the creator update **and delete** rights,
   so players could delete their losing bets.
3. **Over-complicated form submit.** `GameForm` first emitted an event with a Promise callback so the form
   knew when saving finished. That was replaced with a simple `save` function prop – easier to read.
4. **Layout bug found by testing, not by the AI's first draft.** Table cells with `display: flex` broke the
   table borders, and a screen-reader-only label inside a table caused horizontal scrolling on phones.
   Both were only visible in screenshots and had to be fixed afterwards.
5. **Open redirect.** The login redirect first accepted any path starting with `/`, which also matches
   `//evil.com`. The check was tightened.

## Reflection
AI was most useful for producing a lot of consistent boilerplate quickly (components, forms, CSS, tests)
and for suggesting a clean structure. Human evaluation was still necessary for:
- checking that the code matches the **current version** of the libraries,
- **security decisions** – which role may do what, and what the database must enforce, not just the UI,
- **testing in the real browser** – the AI's code compiled but still had visual bugs,
- deciding what to keep **simple** for a school project (e.g. not adding an Appwrite Function) and being
  honest about the resulting limitation.
