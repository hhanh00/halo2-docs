---
title: Halo2 study curriculum
---

# Halo2 study curriculum

A course for programmers with little or no exposure to proving systems. The goal is to understand how a computation becomes a proof, explain what the verifier checks, and implement a small Halo2 circuit whose constraints match its intended statement.

This is a curriculum and lesson specification, rather than a completed textbook. Each module defines what to teach, what to calculate or build, and what the learner should be able to explain before continuing.

## Scope and approach

Assume basic algebra, functions, arrays, and the ability to write a small program. No prior cryptography, abstract algebra, or Rust is required. Use Python or another familiar language for early experiments; introduce the necessary Rust before the Halo2 labs.

Budget **120–150 hours**, approximately **20–25 weeks at six hours per week**. The module estimates below total 120 hours; reserve up to 30 additional hours for review and debugging. Optional extensions are outside this budget.

For each module, spend roughly one third of the time on explanations and worked examples, one third on exercises, and one third on implementation and review. Every lesson should introduce notation, work through a small example, connect it to the proof pipeline, and end with a misconception check.

We derive correctness equations and explain why checks are needed. We state cryptographic security properties and assumptions, but do not prove resistance to cryptanalysis or give formal security reductions. Small fields and curves are for calculations only; implementation labs use library primitives.

### Which Halo2?

The main track uses **Zcash Halo2 with inner-product argument (IPA) polynomial commitments**. PLONK describes the foundation of the arithmetization and argument; it does not uniquely specify the commitment backend. The PSE lineage replaced the original IPA backend with KZG, so examples from different Halo2 implementations are not automatically interchangeable. See the [Zcash implementation](https://github.com/zcash/halo2) and the [PSE fork's explanation of the backend change](https://github.com/privacy-ethereum/halo2#readme).

Pin the chosen Zcash release or commit, Rust toolchain, dependencies, and lockfile when preparing the implementation lessons. Follow examples from that same revision. KZG and pairings are comparison material, not prerequisites for the main IPA labs.

### Learning outcomes

By the end, the learner can:

- Separate a public statement, a private witness, a circuit, and a proof.
- Calculate with finite fields, elliptic-curve groups, and polynomials.
- Distinguish encryption, commitments, and proofs, including their different uses of homomorphism.
- Translate computation into gates, copy constraints, lookups, and polynomial identities.
- Explain commitment, evaluation claims, opening proofs, and transcript challenges.
- Trace a Halo2 proof from witness assignment through verification.
- Build a circuit, produce and verify a proof, and test deliberately incorrect witnesses and public inputs.
- State which guarantees come from assumptions, which come from protocol structure, and which depend on correctly written constraints.

## Course map

Read in order on a first pass. Modules 2–5 provide the algebra for commitments; modules 6–9 provide the proof vocabulary and polynomial machinery; modules 10–14 assemble the protocol; modules 15–18 turn it into working code.

| Module | Topic | Hours | Prerequisites |
| --- | --- | ---: | --- |
| [1](#module-1-what-a-proving-system-does) | Statements, witnesses, and proofs | 3 | Basic programming |
| [2](#module-2-finite-fields-and-groups) | Finite fields and groups | 7 | 1 |
| [3](#module-3-elliptic-curve-arithmetic) | Elliptic-curve arithmetic | 7 | 2 |
| [4](#module-4-elgamal-and-homomorphic-encryption) | ElGamal and homomorphic encryption | 4 | 3 |
| [5](#module-5-commitments-and-cryptographic-hashes) | Commitments and hashes | 5 | 3–4 |
| [6](#module-6-interactive-proofs-and-fiat-shamir) | Interaction and Fiat–Shamir | 6 | 5 |
| [7](#module-7-arithmetization) | Programs as constraints | 8 | 2, 6 |
| [8](#module-8-polynomials-and-evaluation-domains) | Polynomials, interpolation, and FFTs | 8 | 2, 7 |
| [9](#module-9-polynomial-identities-and-quotients) | Vanishing and quotient polynomials | 6 | 8 |
| [10](#module-10-polynomial-commitments-and-openings) | Polynomial commitments and openings | 6 | 5, 9 |
| [11](#module-11-inner-product-arguments) | IPA commitments and openings | 9 | 6, 10 |
| [12](#module-12-plonk-gates-and-permutations) | PLONK gates and copy constraints | 9 | 7–11 |
| [13](#module-13-halo2-custom-gates-and-lookups) | Halo2 gates, rotations, and lookups | 7 | 12 |
| [14](#module-14-the-complete-proof-protocol) | Transcript, blinding, and verification | 7 | 11–13 |
| [15](#module-15-rust-and-the-halo2-circuit-api) | Rust and circuit construction | 7 | 13 |
| [16](#module-16-circuit-testing-and-failure-analysis) | Testing and missing constraints | 6 | 14–15 |
| [17](#module-17-capstone-a-private-bounded-value) | Capstone | 10 | 16 |
| [18](#module-18-recursion-and-backend-comparisons) | Recursion and KZG comparison | 5 | 14, 17 |

## Module 1: What a proving system does

**Question:** How can a verifier check a claim without repeating all the work or learning the private input?

Teach public input $x$, private witness $w$, and a relation $R(x,w)=1$. Distinguish finding a witness from checking it. Introduce prover, verifier, proof bytes, completeness, soundness, knowledge soundness, and zero knowledge. Explain that cryptographic arguments provide soundness against computationally bounded adversaries. Define succinctness separately from privacy; explain the words in “zk-SNARK” without assuming every system has identical costs.

Start with “I know $s$ such that $s^2=y$” over a field. Later revisit this example: a proof does not prevent information already implied by $y$ from being learned, and a small witness space can be searched.

**Exercise:** Write a normal witness checker. Label everything the verifier receives. Compare sending the witness with sending a proof.

**Checkpoint:** Explain why “the verifier accepted” means the encoded relation was satisfied, not necessarily that the programmer encoded the intended claim.

## Module 2: Finite fields and groups

**Question:** What arithmetic do proof systems actually use?

Teach modular reduction; prime fields $\mathbb F_p$; addition, subtraction, multiplication, inversion, and division; Fermat's little theorem as an inversion recipe; and the extended Euclidean algorithm. Distinguish equality modulo $p$ from equality over integers. Explain why modular arithmetic has no intrinsic ordering compatible with ordinary integer comparisons.

Introduce sets, operations, identity, inverses, cyclic groups, generators, group order, scalar multiplication, vectors, dot products, and linear combinations. Distinguish a field from a group and an element from its byte encoding.

**Lab:** Implement toy field arithmetic over $\mathbb F_{17}$. Calculate $5^{-1}=7$, solve linear equations, and demonstrate wraparound. Implement vector dot products for later IPA work.

**Checkpoint:** Explain why a field equation $a+b=c$ alone does not establish an integer addition without overflow. State what bounds would make that interpretation valid.

## Module 3: Elliptic-curve arithmetic

**Question:** How does arithmetic on points provide a useful cryptographic group?

Teach short Weierstrass curves $y^2=x^3+ax+b$, the nonsingularity condition for characteristic greater than three, the point at infinity, negation, addition, doubling, and scalar multiplication. Use a real-plane drawing for intuition, then a finite-field point table for the actual arithmetic. Handle inverse points and doubling a point with $y=0$ explicitly.

Distinguish the **base field**, used for point coordinates, from the **scalar field**, used for multiplication in a prime-order subgroup. Introduce subgroup order, cofactor, point encoding and validation, and multi-scalar multiplication (MSM). State the discrete-logarithm assumption for the selected group.

**Lab:** Enumerate $y^2=x^3+2x+2$ over $\mathbb F_{17}$ and calculate multiples of $(5,1)$. Implement double-and-add and compare it with repeated addition. Contrast these small calculations with library curve operations.

**Checkpoint:** Explain why computing $[s]G$ is practical while recovering $s$ from $G$ and $[s]G$ is assumed hard at suitable parameters. Identify the two different fields in a curve-based commitment.

## Module 4: ElGamal and homomorphic encryption

**Question:** What can be computed on encrypted values, and how is that different from proving a computation?

Use additive group notation. A secret key is $x$, its public key is $Y=[x]G$, and encryption of a group element $M$ with fresh random $r$ is

$$
(R,S)=([r]G,\ M+[r]Y).
$$

Derive decryption $M=S-[x]R$. Add ciphertext pairs and show that the result encrypts the sum of the messages. Teach rerandomization and explain malleability. State that ordinary ElGamal's chosen-plaintext security uses a decisional Diffie–Hellman assumption in the chosen group; discrete-log hardness alone is not the same statement.

Explain exponential ElGamal: encoding an integer $m$ as $[m]G$ supports addition, but decryption returns a point; recovering $m$ requires a bounded search or another decoding method. Distinguish additive homomorphic encryption from fully homomorphic encryption, which supports a much richer computation model.

**Lab:** Encrypt two toy group elements, add their ciphertexts, decrypt, and check the result. Examine what repeated randomness reveals about message differences.

**Checkpoint:** Explain why Halo2 is not an encryption scheme and does not require fully homomorphic encryption. Identify the shared idea of algebraic structure that will reappear in commitments.

## Module 5: Commitments and cryptographic hashes

**Question:** How can a prover fix a value now while revealing only selected information later?

Teach commitment, opening, hiding, and binding. Introduce Pedersen commitments $C=[m]G+[r]H$. Derive addition of commitments and explain the requirement that nobody knows the discrete-log relation between generators. State perfect hiding for uniform blinding and computational binding under the relevant discrete-log assumption. Discuss vector commitments and independently derived generators.

Introduce hash functions as primitives: preimage resistance, second-preimage resistance, collision resistance, fixed encodings, and domain separation. Explain that a plain hash of a low-entropy secret is not a hiding commitment. Introduce Merkle trees and authentication paths as an optional application of hashes.

**Lab:** Open a toy Pedersen commitment and combine two commitments. Deliberately choose $H=[t]G$ with known $t$ and construct two openings of the same commitment.

**Checkpoint:** Distinguish a commitment from ciphertext and from a proof. Explain why the random-oracle model used next is stronger than merely assuming collision resistance.

## Module 6: Interactive proofs and Fiat-Shamir

**Question:** Why must a prover commit before seeing a challenge?

Teach the commit–challenge–response pattern using Schnorr knowledge of $x$ for $Y=[x]G$. Work through $T=[r]G$, challenge $c$, response $z=r+cx$, and the verifier equation $[z]G=T+[c]Y$. Explain correctness algebraically and knowledge/zero-knowledge intuition without a reduction proof.

Replace the verifier's challenge with a hash-derived challenge. Define a transcript as an ordered, unambiguous record with protocol labels and public-statement binding. Explain the need to absorb prior messages before deriving dependent challenges, to map challenges into the field correctly, and to use fresh secret randomness.

**Lab:** Implement a toy Schnorr transcript. Recover $x$ from two responses that reuse $r$ with different challenges. Try changing the public statement after producing a proof.

**Checkpoint:** Explain the random-oracle idealization, why hashing only the last message is insufficient, and why challenge order is part of the protocol.

## Module 7: Arithmetization

**Question:** How does a program become equations that a prover must satisfy?

Translate $y=x^3+x+5$ into intermediate values and multiplication/addition constraints. Introduce arithmetic circuits and R1CS as one representation, then a PLONK-style table of cells and local gate equations. Separate witness generation from constraint enforcement: calculating a value in host code does not constrain it.

Teach public inputs, constants, boolean constraints $b(b-1)=0$, conditional selection $z=bu+(1-b)v$, and bit decomposition. Explain range constraints, integer interpretation, and equality between values used in different places. Avoid witness-dependent circuit shape and unconstrained branching.

**Lab:** Build a small constraint evaluator for the cubic example. Add a bounded integer input using bits. Delete one equation and find an assignment that the weakened checker accepts.

**Checkpoint:** Specify the exact public statement and every necessary equation. Explain why two cells holding the same assigned value are not automatically constrained equal.

## Module 8: Polynomials and evaluation domains

**Question:** How can a whole column of values become a single algebraic object?

Teach polynomial degree, coefficient representation, evaluation, interpolation, and the uniqueness of a degree-less-than-$n$ polynomial through $n$ distinct points. Build the Lagrange basis. Introduce roots of unity, a domain $H=\{1,\omega,\ldots,\omega^{n-1}\}$, and the requirement that $n$ divide the field's multiplicative-group order.

Explain FFT/IFFT as efficient changes between coefficient and evaluation forms. Cover pointwise multiplication, growth in degree, extended domains, and why multiplying on too small a domain aliases the result. Introduce cosets as useful evaluation sets outside $H$.

**Lab:** In $\mathbb F_{17}$, use $n=4$ and $\omega=4$. Interpolate a column, recover its evaluations, and compare polynomial multiplication with pointwise multiplication on different domain sizes.

**Checkpoint:** Explain why four values specify a degree-at-most-three polynomial only when the degree bound is part of the claim.

## Module 9: Polynomial identities and quotients

**Question:** How do many row checks become an identity checked at a random point?

Define the vanishing polynomial $Z_H(X)=\prod_{h\in H}(X-h)=X^n-1$. Derive that a constraint polynomial $F$ vanishes on $H$ exactly when $F=QZ_H$ for a polynomial $Q$. Work through polynomial division and degree bounds.

State the root-count fact: a nonzero polynomial of degree at most $d$ has at most $d$ roots. For a uniformly sampled point from a set $S$, an already-fixed nonzero polynomial passes the zero check with probability at most $d/|S|$. Explain why this local bound is not a complete soundness proof for the entire protocol.

Teach random linear combinations of constraints and why cancellation must not be chosen after seeing the batching challenge. Explain quotient splitting when commitment degree limits require several pieces.

**Lab:** Interpolate a multiplication table, construct $F=A B-C$, divide by $Z_H$, and inspect the remainder. Corrupt a row and repeat. Use a coset to avoid division by zero during evaluation.

**Checkpoint:** Explain why the verifier needs commitments and opening proofs as well as an equation at a random point.

## Module 10: Polynomial commitments and openings

**Question:** How can a verifier trust $f(z)=v$ without receiving all of $f$?

Define a polynomial commitment scheme through setup/parameter generation, commit, open, and verify. Include the degree bound and optional hiding randomness. Distinguish opening an entire committed message from proving one evaluation of a committed polynomial.

For $f(X)=\sum_i a_iX^i$, rewrite evaluation as $f(z)=\langle\mathbf a,(1,z,z^2,\ldots)\rangle$. This is the bridge to IPA. Introduce multiple polynomials at one point, multiple points, random batching, and the need to bind claims before batching challenges.

**Lab:** Write the interfaces for a toy scheme that reveals all coefficients. It is inefficient and non-hiding, but makes the commitment/evaluation/verification roles concrete. Trace what must change to avoid revealing the coefficients.

**Checkpoint:** Explain why a commitment alone establishes no evaluation claim and why a claimed value without an opening proof cannot be trusted.

## Module 11: Inner-product arguments

**Question:** How can a long vector relation be reduced to a short sequence of checks?

Start with a vector commitment $C=\sum_i[a_i]G_i+[r]H$ and evaluation as a dot product. First study an unblinded educational inner-product relation. Split vectors into left and right halves, identify the cross terms, send the round commitments, and use a challenge to fold into half-size vectors. Track an explicit invariant through each fold before introducing the full hiding protocol.

Work through length four, then eight. Explain logarithmic rounds and proof communication separately from verification work: a short IPA proof does not automatically mean logarithmic total verifier work. Account for generator combinations and MSMs. Restore blinding, the evaluation relation, and the exact checks from the chosen implementation's protocol.

**Lab:** Implement and check one fold, then a full toy inner-product argument. Alter a cross-term message and a final scalar. Trace which verification equation fails. Compare the toy exercise with Halo2's commitment and multi-opening code.

**Checkpoint:** Explain where the evaluation point enters, what the generator assumptions are, and why omitting blinding is unacceptable for a claim of zero knowledge.

## Module 12: PLONK gates and permutations

**Question:** How are computation and wiring checked together?

Introduce a basic gate equation

$$
q_Mab+q_La+q_Rb+q_Oc+q_C=0.
$$

Represent witness columns and selectors as polynomials. Encode public inputs using the chosen convention, stating its sign and placement. Construct the gate quotient from module 9.

Then explain why local gates do not enforce wiring. Give every relevant cell a distinct position label, encode copies as permutation cycles, and compress value/label pairs with challenges. Build a grand-product recurrence comparing the original and permuted encodings. Include start/end boundary constraints, challenge timing, and the treatment of exceptional zero denominators in the specified protocol.

**Lab:** Lay out the cubic circuit in a small table. Draw its copy cycles. Check the permutation product for a valid assignment, then change a copied value while keeping its local gate satisfied.

**Checkpoint:** Explain the distinct jobs of gate, permutation, boundary, and public-input constraints. Reconstruct the argument stages with commitments and opening checks treated as previously learned components.

The [original PLONK paper](https://eprint.iacr.org/2019/953) is a reference for this module; reading its security proof is not required.

## Module 13: Halo2 custom gates and lookups

**Question:** What does Halo2 add to the basic table model?

Teach advice, fixed, and instance columns; selectors; current/previous/next row rotations; custom gates; equality constraints; and lookup tables. Advice carries prover-assigned values, fixed columns describe circuit constants, and instance columns carry public inputs. Follow the terminology in the [Halo2 design overview](https://zcash.github.io/halo2/design.html).

Explain lookups as constrained table membership, not a host-language array access. Cover repeated inputs, table multiplicity, tuple compression, padding, disabled rows, and the lookup argument used by the pinned implementation. Compare a small range lookup with bit decomposition. Track degree, rows, advice columns, and lookup costs.

**Lab:** Design a four-bit range table and a two-row custom gate. Specify selector activation and rotation behavior at boundaries. Compare the range check with four boolean constraints plus reconstruction.

**Checkpoint:** Explain what happens when a selector is never enabled, a rotated cell crosses the intended region boundary, or a lookup proves membership in the wrong table.

## Module 14: The complete proof protocol

**Question:** What does the verifier actually receive and check?

Assemble a dependency-ordered trace: parameters and circuit keys; public statement; witness commitments; challenges for permutation and lookup arguments; auxiliary commitments; constraint-combination challenges; quotient commitments; evaluation challenges; claimed evaluations; and opening proofs. Match the exact ordering to the pinned backend instead of treating this conceptual list as an implementation specification.

Explain witness-polynomial blinding, commitment blinding, reserved rows, and randomness in the opening protocol. Separate soundness from zero knowledge: correctly checked equations alone do not establish privacy. Explain what verifying/proving keys depend on and distinguish circuit-specific key generation from a trusted setup ceremony.

**Lab:** Create a transcript table with four columns: message, sender, information fixed so far, and next challenge. Trace a tiny proof through the implementation. List all data available to the verifier.

**Checkpoint:** Explain which checks connect the public input to the witness, why challenges cannot be moved earlier, and why transparent setup does not mean an absence of public parameters or assumptions.

## Module 15: Rust and the Halo2 circuit API

**Question:** How do the mathematical objects appear in code?

Give a focused Rust introduction: structs, traits, generics, ownership as encountered in examples, closures, `Result`, and tests. Then study `Circuit`, configuration, synthesis, `Value`, assigned cells, regions, layouters, chips, selectors, and equality-enabled columns in the selected version.

Separate circuit configuration from witness assignment. Explain witness-free synthesis for key generation, consistent circuit shape, instance binding, and the size parameter $k$ with a domain of $2^k$ rows. Include unusable/blinding rows when choosing capacity.

**Lab:** Implement the cubic relation first. Bind its output to an instance column. Run `MockProver`, generate keys, create a real proof, serialize it, and verify it with the declared public input. Record the dependency revision and toolchain.

**Checkpoint:** Identify the exact source lines responsible for each mathematical constraint. Explain why a host assertion is not a circuit constraint.

## Module 16: Circuit testing and failure analysis

**Question:** How can a circuit pass honest examples while proving the wrong statement?

Teach missing constraints, unbound public inputs, missing copy constraints, inactive selectors, unchecked range assumptions, and field/integer confusion. Distinguish a bad witness rejected by the intended circuit from a modified circuit that accidentally accepts more witnesses.

**Lab:** Test valid inputs, invalid intermediates, changed public inputs, range boundaries, inconsistent copies, and insufficient row capacity. Remove constraints deliberately and build counterexamples. Where an honest witness generator refuses to produce a bad assignment, provide a test-only assignment path to test the constraint system itself.

Run both `MockProver` checks and a real prove/verify round trip. Check rejection of a proof verified against changed instance values. Record rows, columns, degree, proof size, proving time, and verification time for the local configuration.

**Checkpoint:** Explain why `MockProver` is useful but does not establish cryptographic security, zero knowledge, or absence of all missing constraints. Explain why randomized testing cannot replace reviewing the relation.

## Module 17: Capstone: a private bounded value

**Question:** Can you design, implement, and explain a complete proof from a written statement?

Use the relation

$$
R((d,t),(s,r))=1
\quad\Longleftrightarrow\quad
 d=H_{\mathrm{tag}}(s,r)\ \land\ 0\le s<t\le 2^{16}.
$$

Here $d$ and $t$ are public, $s$ and a random field element $r$ are private, and $H_{\mathrm{tag}}$ is a specified, domain-separated, fixed-length hash over field elements. The comparison uses bounded integer representatives. Choose a field large enough to rule out wraparound in the bounded arithmetic below.

**Milestones:**

1. Write the statement and a plain reference checker. Specify encodings, hash parameters, randomness, and the leakage inherent in $d$ and $t$.
2. Decompose $s$ into 16 bits. Introduce 16-bit values $u,v$ with $u=t-1$ and $v=t-1-s$ enforced as field equations. These bounds establish $1\le t\le2^{16}$ and $s<t$ when the field is sufficiently large, for example $p>2^{17}$.
3. Constrain the hash using an existing compatible gadget, including its exact domain and input ordering. A hash computed only in host code does not satisfy this requirement.
4. Bind both $d$ and $t$ to instance cells. Implement witness assignment, circuit keys, proof creation, serialization, and verification.
5. Test $s=0,t=1$ and $s=65535,t=65536$ as valid cases. Reject $s=t$, $t=0$, $t=65537$, out-of-range witnesses, a wrong digest, and altered public inputs. Test the constraint relation using deliberately invalid assignments, not just the reference checker.
6. Submit a circuit diagram, constraint inventory, assumption inventory, negative-test results, and a reproducible performance report.

A salted hash is used here as an application commitment. Collision resistance supports binding; hiding additionally relies on unpredictable sufficient-entropy salt and an appropriate assumption about the hash construction, not collision resistance alone. Use a library hash such as a compatible Poseidon gadget with documented parameters. Do not substitute a homemade algebraic hash.

**Completion standard:** Another learner can map every clause of the written statement to constraints, reproduce a proof, and demonstrate rejection when either public input changes. This is an educational implementation, not a claim of a completed security audit.

## Module 18: Recursion and backend comparisons

**Question:** How do proofs compose, and what changes when the commitment backend changes?

Introduce verifying a proof inside another circuit, native versus non-native arithmetic, curve cycles, accumulation, and deferred verification work. Distinguish recursive verification, aggregation, and folding. Explain the motivation for the Pasta curve cycle without assuming that the standard proof API automatically supplies a recursive circuit.

Compare IPA and KZG at the level of setup, assumptions, opening equations, proof size, verifier work, and recursion costs. For KZG, introduce bilinear pairings and the structured powers of a hidden setup value. Derive the opening witness polynomial $q(X)=(f(X)-f(z))/(X-z)$ and explain how a pairing equation checks its relation to the commitment. State the backend-specific assumptions and trusted-setup requirements rather than transferring IPA assumptions to KZG.

**Exercise:** Write a one-page comparison of the two backends and draw which work an accumulator defers. Optional extension: study a concrete recursive proof construction from its own specification.

**Checkpoint:** Explain why a curve cycle helps arithmetic compatibility, why a KZG tutorial may not match the main course code, and why Halo2, Halo, and PLONK are related but distinct names.

## Assumptions to state explicitly

Maintain this ledger throughout the course. Mathematical correctness equations are worked through; the hardness claims and protocol security results are stated with their scope. Each implementation lesson must name the concrete group, field, hash, parameters, and backend it uses.

| Component | Property or assumption accepted | What still needs explanation or checking |
| --- | --- | --- |
| Finite fields and polynomials | Exact algebra, not a cryptographic hardness assumption | Degree bounds, valid domains, integer bounds, and exceptional cases |
| Elliptic-curve group | Discrete logarithms are hard at selected parameters | Correct subgroup, encodings, point validation, and base/scalar distinction |
| ElGamal | DDH in the selected group for ordinary chosen-plaintext security | Fresh randomness, message encoding, and malleability; no claim of chosen-ciphertext security |
| Pedersen commitments | Discrete-log binding with no known generator relations; perfect hiding with uniform blinding | Generator derivation, scalar ranges, and correct randomness |
| Hash functions | Collision, preimage, and second-preimage resistance as required by the application | Encoding, domain separation, parameter choice, and low-entropy inputs |
| Fiat–Shamir | The chosen protocol's security result in its stated random-oracle model | Transcript ordering and binding of the statement and all required messages; collision resistance alone does not imply this result |
| IPA polynomial commitments | Stated binding/evaluation knowledge guarantees under the construction's discrete-log and security-model assumptions | Degree bounds, independent generators, blinding, batching, and exact verification equations |
| Full proving protocol | The specified construction's completeness, knowledge soundness, and zero-knowledge results under its declared model | Composition, implementation fidelity, challenge scheduling, and application constraints; not a blanket consequence of discrete-log hardness |
| Randomness | A suitable cryptographic RNG supplies unpredictable randomness | Fresh secret randomness and correct sampling; transcript challenges have a different source |
| Capstone hash commitment | Collision resistance for binding; suitable hiding assumption with a high-entropy secret salt | Exact hash/gadget agreement and public-input binding |
| KZG extension | The selected KZG variant's pairing-based binding/knowledge assumptions, often involving a degree-bounded strong-Diffie–Hellman assumption and additional model assumptions | State the precise theorem used; correct structured reference string and unknown/destroyed setup trapdoor |

Excluded: cryptanalytic attacks on the selected hash or curve, formal extraction/simulation reductions, and a production side-channel audit. Included: understanding the advertised guarantees and showing how an incorrect circuit or transcript can invalidate their application.

## Assessment and review

Use four review gates rather than testing only at the end:

- **After module 6:** Calculate field and curve operations; contrast encryption, commitment, and proof; reconstruct a Schnorr transcript.
- **After module 11:** Turn a column into a polynomial, derive a quotient identity, and explain an IPA evaluation opening with a length-four example.
- **After module 14:** Walk through a complete proof and identify the purpose of each commitment, challenge, and verifier equation.
- **After module 18:** Present the capstone, demonstrate negative tests, and explain assumptions and backend tradeoffs.

Assess arithmetic/constraint correctness (30%), explanation of the protocol (25%), implementation and negative tests (30%), and clarity of the assumption inventory (15%). Advance when the learner can explain the checkpoint and demonstrate the lab; revisit prerequisites when either is missing.

## Reading path

These references support the course; they are not assigned cover to cover at the start.

- **Modules 1–9:** Use the [Halo2 Book background material](https://zcash.github.io/halo2/background.html) alongside the toy calculations. Supply worked finite-field and group examples before sending beginners into protocol notation.
- **Modules 10–14:** Read the relevant commitment, polynomial, permutation, lookup, and protocol sections of the [Halo2 Book](https://zcash.github.io/halo2/), then compare with the selected source revision. Use the [PLONK paper](https://eprint.iacr.org/2019/953) for the original argument structure.
- **Modules 15–17:** Use examples and tests in the pinned [Zcash Halo2 repository](https://github.com/zcash/halo2), especially `halo2_proofs` for circuits and proofs and `halo2_gadgets` for reusable constructions.
- **Module 18:** Compare the [PSE implementation's backend notes](https://github.com/privacy-ethereum/halo2#readme) with the IPA main track. Treat these as comparison material and check the selected revision before borrowing an API or assumption.

## Optional extensions

After the capstone, choose an application: Merkle membership with a public root; proof of correct ElGamal encryption; a small private transfer relation; or recursive aggregation. Each extension begins with a relation and an assumption inventory. Fully homomorphic encryption, pairing implementation, hash design, and advanced cryptanalysis are separate courses rather than required detours.

## Site authoring notes

### Search

Page headings and content are indexed by the site search.

### Manim diagrams

Useful future lesson diagrams include finite-field point addition, Lagrange interpolation, copy-permutation cycles, IPA vector folding, and the transcript dependency graph. Add scenes to `docs/manim`, register them in `scripts/render-manim-diagrams.mjs`, then run:

```sh
pnpm docs:manim
```
