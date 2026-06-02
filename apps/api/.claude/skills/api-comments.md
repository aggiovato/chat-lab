# Skill: API Business Logic Comments

## Purpose

Review the code in scope and add inline comments **only** where a non-obvious business constraint, domain invariant, or deliberate design decision requires explanation. Remove or flag any comment that merely restates what the code already says.

---

## Hard rules

1. **English only.** Every comment in `apps/api/` must be written in English, no exceptions.
2. **One line max.** A comment is a single line placed directly above the relevant block. No multi-line blocks, no docstrings.
3. **Explain the WHY, never the WHAT.** If removing the comment would not confuse a future reader, delete it.
4. **No task/ticket references.** Comments must not reference issue numbers, PR descriptions, or who wrote the code.

---

## When a comment IS required

Add a comment when the code encodes a rule that is not derivable from the identifier names alone:

| Trigger | Example comment |
|---|---|
| A domain constraint that prevents a common mistake | `// Creator is always OWNER — skip if already in memberIds to avoid duplicate` |
| A deliberate soft-delete over hard-delete | `// Messages are soft-deleted; hard DELETE is never used to preserve read receipts` |
| Cursor-based pagination mechanics | `// Skip the cursor message itself; only return older messages` |
| A race-condition guard or upsert rationale | `// Upsert prevents duplicate reactions for the same (message, user, emoji) triple` |
| An asymmetric dependency that prevents circular imports | `// realtime depends on messages, not the other way around — keep this direction` |
| A security-sensitive shortcut | `// Reject before handshake completes — no event should fire on unauthenticated sockets` |

---

## When a comment is NOT needed

- The method or variable name already expresses the intent.
- The comment just repeats the operation in prose (`// Find user by id` above `prisma.user.findUnique`).
- Standard NestJS/Prisma patterns that any developer would recognize.
- DTO field validations — the decorators are self-documenting.

---

## Format

```typescript
// <Constraint or invariant in plain English, one sentence.>
const result = someNonObviousOperation();
```

Place the comment **above** the expression it describes, never at the end of the line.

---

## Example audit

```typescript
// BEFORE — comment restates the code, delete it
// Get messages for the conversation
const messages = await this.prisma.message.findMany({ where: { conversationId } });

// AFTER — comment explains a non-obvious pagination rule, keep it
// Skip the cursor message itself; fetch only messages older than the given cursor
const messages = await this.prisma.message.findMany({
  where: { conversationId, createdAt: { lt: cursor.createdAt } },
});
```

```typescript
// BEFORE — obvious from the method name, delete it
// Hash the password before saving
const hash = await this.passwordService.hash(dto.password);

// AFTER — if there's a constraint worth noting
// bcrypt work factor is fixed at 12 to balance security and login latency
const hash = await this.passwordService.hash(dto.password);
```

---

## How to apply this skill

1. Read the file or diff in scope.
2. For each existing comment, apply the rules above: keep, rewrite, or delete.
3. For each non-obvious logic block **without** a comment, decide if one is warranted.
4. Output a summary: list of comments added, rewritten, or removed with a one-sentence justification for each change.
