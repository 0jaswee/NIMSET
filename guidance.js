// Added editorial study guidance: not extracted planner text or verified PYQ frequencies.
const guides=[
 [/general|orientation|trend analysis/i,'Understand the exam structure, your starting point and the lecture sequence.','This is an introduction, not a separate scoring chapter.'],
 [/bridge course|basic maths/i,'Build foundations in numbers, algebraic rules, inequalities, modulus and graphs. Record the conditions for each rule and a counterexample.','These skills support algebra and calculus by reducing domain, sign and simplification errors.'],
 [/straight line/i,'Connect coordinates, slope, line equations, distance and intersections with sketches.','Suggested practice: derive a line from conditions, calculate distance or angles, and solve concurrency or locus problems.'],
 [/circle/i,'Start with centre-radius form, then study the general equation, tangents, normals and chords.','Suggested practice: tangent conditions, common chords, radical axes and line-circle intersections.'],
 [/parabola/i,'Identify the standard form, focus, directrix and parameter on a diagram.','Suggested practice: tangents and normals, focal chords, and equations with a shifted vertex.'],
 [/ellipse/i,'Keep the axes, eccentricity, foci and conditions for parametric coordinates clear.','Suggested practice: identify standard equations and apply tangent, normal or chord conditions.'],
 [/hyperbola/i,'Distinguish branches, transverse axis, eccentricity and asymptotes from the ellipse.','Suggested practice: asymptotes, conjugate or rectangular hyperbolas, and tangent conditions.'],
 [/quadratic/i,'Study roots and coefficients, the discriminant and graph signs together.','Suggested practice: location of roots, common roots, parameter ranges and transformed roots.'],
 [/sequence|series|progression/i,'Understand AP, GP, HP and the conditions for finite and infinite sums.','Suggested practice: nth terms, missing terms, means and mixed series. Check convergence before using infinite-sum formulas.'],
 [/sets|relation|venn/i,'Use examples to understand set operations, cardinality, Cartesian products and relations.','Suggested practice: Venn counts, inclusion-exclusion, relation types and functions. Check truth tables separately.'],
 [/binomial/i,'Connect the general term, coefficients and term indexing with the full expansion.','Suggested practice: coefficients, middle terms, greatest terms and remainders.'],
 [/permutation|combination/i,'Decide whether order matters before listing restrictions and splitting cases.','Suggested practice: arrangements, selections, distributions and dictionary ranks. Avoid double counting.'],
 [/probability/i,'Define the sample space, events and conditional information clearly.','Suggested practice: dependent or independent events, conditional probability and Bayes. Use favorable/total only for equally likely outcomes.'],
 [/statistic/i,'Understand the meaning of central tendency, dispersion and combined-data formulas.','Suggested practice: missing values, variance, standard deviation and frequency data. Check moments and frequency distributions against the official checklist.'],
 [/matrices|determinant/i,'Connect matrix dimensions, operations, determinants, inverses and linear systems.','Suggested practice: determinant properties, inverses and consistency. Eigenvalues and Cayley-Hamilton appear in the planner but are not named in the official 2026 list; treat them as extensions.'],
 [/trigonometry|trigo-|triangle|height and distance/i,'Record identities, signs, principal ranges and the conditions for triangle relations.','Suggested practice: simplify identities, find general solutions and principal inverse values, and model height-distance problems.'],
 [/function/i,'Study domain, range, mappings, composition and inverses using both graphs and algebra.','Suggested practice: restricted domains, even or odd functions, periodicity and inverse or composite evaluations.'],
 [/limits/i,'Identify left and right behavior and indeterminate forms before choosing a method.','Suggested practice: factorization, standard limits, expansions and unknown parameters. Check the conditions before applying L’Hôpital.'],
 [/continuity/i,'Check point values, limits and derivative existence separately.','Suggested practice: parameters in piecewise functions, continuity versus differentiability, corners and jumps.'],
 [/differentiation/i,'Learn standard derivatives, then practise chain, implicit and parametric differentiation.','Suggested practice: composite and implicit derivatives, logarithmic differentiation and higher derivatives.'],
 [/application of derivatives/i,'Interpret derivative signs through slopes, rates, graphs and extrema.','Suggested practice: tangents, normals, monotonicity, maxima and minima, and mean value theorem conditions.'],
 [/indefinite integration/i,'Choose substitution, partial fractions or integration by parts from the form of the integrand.','Suggested practice: find an antiderivative and check it by differentiation. Include the arbitrary constant.'],
 [/definite integration/i,'Use bounds and symmetry, and change the boundaries when substituting.','Suggested practice: even or odd and periodic integrands, and definite-integral properties. Special Gamma results are planner extensions.'],
 [/area under curve/i,'Sketch intersections and positive or negative regions before integrating.','Suggested practice: enclosed areas, choosing an axis and piecewise integration. Distinguish signed integrals from areas.'],
 [/differential equation/i,'Recognize order, degree, separable forms and linear differential equations.','Planner extension: differential equations are not named in the official 2026 calculus list. Review the 2027 brochure before deciding their priority.'],
 [/computer basics/i,'Understand the roles of the CPU, instruction cycle, computer organization and memory.','Suggested practice: component-function matching, memory hierarchy and basic organization MCQs.'],
 [/computer hardware/i,'Compare input and output devices, primary memory and storage devices.','Suggested practice: device identification, RAM/ROM/cache, storage properties and units.'],
 [/computer software/i,'Separate the roles of operating systems, drivers, utilities and applications.','Suggested practice: software classification, OS functions and everyday tool concepts.'],
 [/data representation/i,'Work through base conversions, signed numbers, binary arithmetic and Boolean rules by hand.','Suggested practice: binary/hex conversions, complements, truth tables and number representations. Go beyond memorizing definitions.'],
 [/internet|email/i,'Understand basic networking, the web, browsers, email and online security.','Suggested practice: browser and website components, safe email use and threat identification.'],
 [/database|programming/i,'Learn through small examples of databases/SQL, algorithms and control flow.','Planner extension: DBMS, SQL and programming are not separately named in the official 2026 computer list. Finish the listed basics first and check the 2027 syllabus.'],
 [/english comprehension/i,'Read a short passage and mark its main idea, tone and supporting evidence.','Suggested practice: inference, central ideas, factual details and elimination of unsupported options.'],
 [/vocabulary/i,'Record each new word with its meaning and a sentence, then revisit it regularly.','Suggested practice: contextual meanings, phrases and one-word substitution. Use a short daily revision session.'],
 [/grammar/i,'Create examples for parts of speech, tense, agreement and sentence structure.','Suggested practice: error spotting, sentence correction, rearrangement and usage. Check technical writing and word formation against the official checklist.'],
 [/logical reasoning/i,'Record each condition in a diagram or table, without adding unsupported assumptions.','Suggested practice: series, arrangements, coding, relations, directions, syllogisms and data sufficiency. Build accuracy before speed.'],
 [/quantitative aptitude/i,'Build small models for ratios, percentages, averages, work rates and distance.','This is supporting practice for numerical reasoning and DI, not a separate official NIMCET section. No fixed topic-wise question count or weightage is claimed.']
];
const specific=[
 [/blood relation/i,'Draw a family tree and track generation and gender separately.','Practise coded relations and identifying relationships between two people.'],
 [/arrangement/i,'Create a table of slots or positions and place definite clues first.','For linear or circular seating, check facing directions and changes in left/right perspective.'],
 [/syllog/i,'Represent all, some and no statements using Venn sets.','Accept only necessary conclusions. A statement does not automatically imply its converse.'],
 [/coding|decoding/i,'Test letter shifts, positions and substitution rules against every example.','Apply a consistent rule to a new code. Do not assume one example proves a rule.'],
 [/direction|distance/i,'Record each movement using coordinates or compass directions.','Distinguish the final direction from the shortest distance.'],
 [/data sufficiency/i,'Check each statement separately, then examine them together.','Decide whether the answer is unique; a complete calculation may not be needed.'],
 [/data interpretation|visualization/i,'Read the chart or table units, axes and base totals first.','Suggested practice: ratios, percentage changes and comparisons across charts.'],
 [/percentage|profit|discount|interest/i,'Write down the base value, rate and time period. Multiply factors for successive changes.','Practise percentage changes, cost/selling price and simple or compound growth under time limits.'],
 [/time.*work|time.*speed|distance|mixture|alligation/i,'Model the problem using quantity = rate × time or a weighted average.','Suggested practice: combined rates, relative speeds, units and mixture ratios.'],
 [/noun|pronoun|adjective|verb|adverb|tense|conjunction|preposition|voice|narration/i,'Apply each rule to example sentences and record common mistakes.','Suggested practice: correct usage, tense or structure corrections and sentence transformations.'],
 [/practice|revision|pyq|previous year|doubt/i,'Attempt questions without notes, then classify mistakes as concept, calculation or time-management errors.','This is a practice or revision lecture. PYQ is a planner label; no actual PYQ questions or verified frequency dataset are supplied here.']
];
export function guidance(n,nodes){
 const chain=[];let p=n;while(p){chain.unshift(p.title);p=nodes.find(x=>x.id===p.parentId);}const text=chain.join(' / ');
 const unit=n.source?.unit||n.title;const g=guides.find(([r])=>r.test(unit))||guides.find(([r])=>r.test(text));const s=n.kind==='lecture'?specific.find(([r])=>r.test(n.title)):null;
 return {description:n.description||s?.[1]||g?.[1]||'Study the key ideas, work through small examples, and record rules and mistakes in your notes.',relevance:n.relevance||s?.[2]||g?.[2]||'This is editorial study guidance. Check the official syllabus before setting your priorities.',priority:/general|orientation/i.test(unit)?'Introduction':/database|programming|differential equation/i.test(unit)?'Planner extension':/bridge|basic maths/i.test(unit)?'Foundation':n.source?.subject==='Mathematics'||chain[0]==='Mathematics'?'Core practice':'Regular practice'};
}
export const officialUrl='https://nimcet.admissions.nic.in/document/revised-syllabus-of-nimcet-2026-onwards/';
