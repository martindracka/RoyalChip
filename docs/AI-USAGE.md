# AI usage & reflection

## Tools

| Tool | Model | Where |
| --- | --- | --- |
| Claude Code (Anthropic) | Claude Opus 5.5 | VS Code extension, working directly in the repository |

I did not use other AI tools for this project. Claude Code can read and edit files and run commands
(tests, build, a headless browser for screenshots), so I could ask it to check its own changes, but I
reviewed every change before keeping it.

---

## What I used AI for

| Area | How AI helped | What I did myself |
| --- | --- | --- |
| Planning | Proposed the folder structure (views / components / composables / services / stores) and the Appwrite data model | Chose the theme and features, decided which tables and roles make sense |
| Code | Generated first versions of components, game logic, forms and the Appwrite setup script | Tested in the browser, asked for changes, rejected over-complicated parts |
| Debugging | Read error messages and suggested causes | Confirmed the cause before accepting a fix |
| Security | Reviewed the project as an attacker and listed weaknesses | Decided what to fix and what is an accepted risk (documented in SECURITY.md) |
| Tests | Wrote unit tests and tests that simulate attacks | Checked that the tests really fail when the protection is removed |
| Design | Redesign, icons and photos, checked with screenshots on desktop and mobile | Gave feedback on what looked unprofessional |
| Documentation | Drafted README, SECURITY.md and these notes | Corrected them so I can explain every point |

---

## Example 1 – AI helped: moving the games to the server

The first working version ran every game in the browser: the browser decided the result and saved the new
balance into the player's own profile row. It worked, but when I asked for a security review the AI pointed
out that any player could open the console and send `balance: 1000000` straight to Appwrite, or create fake
bets and claims, because players had `create`/`update` permissions on those tables.

Together we moved everything that changes chips into one **Appwrite Function**
([functions/casino](../functions/casino)). The browser now only sends the player's choice; the server checks
the input, draws the result and changes the balance. Players have read-only access to the database.

Two suggestions from this step I found especially useful:
- taking the stake with Appwrite's **atomic `decrementRowColumn` with `min: 0`** instead of "read balance →
  subtract → save", so two parallel bets can't spend the same chips;
- moving the game rules to `shared/` so the server and the UI use the same code, and giving the Function a
  tiny database adapter so the **real Function code can be tested** with an in-memory database
  ([tests/server.test.js](../tests/server.test.js)).

---

## Example 2 – AI suggestions I had to correct or reject

1. **A race condition in the AI's own server code.** The first server version of blackjack marked a hand as
   finished with a normal update *before* paying, and the comment claimed this prevents double payment.
   It doesn't: two "Stand" requests sent at the same moment both read the hand as *playing* and both pay.
   I asked for a test that sends three Stands in parallel – it failed. The fix is an atomic `open` flag
   (1 → 0) that only one request can close. I also checked that the test fails again when the fix is removed,
   so the test really proves something. A related problem: a parallel "Hit" could write the status back to
   *playing*; now Hit only writes the cards.

2. **Outdated Appwrite API.** The usual examples use `Databases` with *collections/documents*
   (`createDocument`). In the SDK version I installed these are deprecated in favour of **TablesDB**
   (*tables/rows*, `createRow`). I had to check the SDK's type definitions and adapt the code.

3. **A design that Appwrite does not allow.** For the invite programme the first idea was that the friend's
   browser creates a reward row readable by the inviter. In Appwrite a user can only give permissions for roles
   they have themselves, so this fails. I changed it to a `referredBy` field on the friend's profile.

4. **A broken unit test.** The AI wrote `beforeEach(() => vi.mocked(getRow).mockReset())`. The arrow function
   *returns* the mock, and Vitest treats a returned function as a cleanup callback – so all three tests failed
   with a confusing error. Writing the body in braces fixed it. Lesson: generated code can be valid
   JavaScript and still be wrong for the framework.

5. **Incomplete open-redirect check.** The login redirect accepted any path starting with `/` but not `//`.
   Browsers treat `/\evil.com` the same as `//evil.com`, so I added a check for backslashes and control
   characters and wrote tests for these cases ([src/lib/redirect.js](../src/lib/redirect.js)).

6. **Platform-specific bug.** The script that packages the Function called `tar` with a Windows path.
   GNU tar (Git Bash) reads `C:` as a remote host name and fails. The fix was to run tar with relative paths.

7. **Things only visible in the browser.** Several layouts compiled fine but looked broken (table borders,
   horizontal scroll on phones, an orphan tile in a grid). These were found only by looking at screenshots.

---

## Reflection

**Where AI was useful**
- Producing a lot of consistent code quickly – components, forms, CSS, tests, documentation.
- Looking at the project from an attacker's point of view and listing concrete weaknesses I would not have
  thought of (parallel requests, peeking at the blackjack deck, faked usernames on the leaderboard).
- Explaining library behaviour (Appwrite permissions, atomic operations, Vitest hooks) when I asked "why".

**Where human evaluation was still necessary**
- **Security:** the AI wrote a comment saying the blackjack code was safe when it was not. Claims like
  "this prevents X" must be proven with a test, not trusted.
- **Library versions:** the AI's default knowledge did not always match the installed Appwrite SDK.
- **Real behaviour:** compiling is not working – the UI had to be checked in a browser and on a phone.
- **Scope and honesty:** deciding what is good enough for a school project and writing down what is *not*
  protected (SECURITY.md, section 6) instead of pretending everything is perfect.

My main takeaway: AI is a very fast pair programmer, but I am responsible for the result. I only kept code
I could explain, and I used tests and the browser to check its claims.
