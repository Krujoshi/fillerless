// Fillerless content: passages, topics, questions, frameworks and the learning path.
const PASSAGES = {
  p1: { title: "Why pauses work", level: 1,
    text: "Most speakers are afraid of silence. When a sentence ends, they rush to fill the gap with a sound, because a quiet second feels like an hour. But the audience experiences it differently. A short pause tells listeners that an important idea just landed, and it gives them time to absorb it. It also gives you time to breathe and choose your next words. The speakers we remember rarely talk fast. They stop, look up, and let a good sentence do its work. Practice this today: finish a thought, close your mouth, count one beat in your head, then continue. It will feel strange at first. That strange feeling is the sound of a filler word being replaced by confidence.",
    gloss: { absorb: "to take in and understand something fully", filler: "a sound or word, like um, used to fill silence", pause: "a short stop in speaking", beat: "a very short moment of time", rush: "to move or act too quickly" } },
  p2: { title: "Opening a meeting", level: 1,
    text: "A good meeting begins in the first thirty seconds. State the purpose, the outcome you need, and how long it will take. For example: today we need to choose a launch date, and we have twenty minutes. Notice what that sentence does. It focuses the room, it shows that you respect everyone's time, and it makes it easy to steer people back if the conversation drifts. If a tangent appears, thank the speaker, note the idea for later, and return to the agenda. Close the meeting the same way you opened it, by summarising the decisions and naming who owns each next step.",
    gloss: { tangent: "a side topic that moves away from the main point", agenda: "the list of things a meeting will cover", drifts: "moves slowly away from the topic", steer: "to guide the direction of something", owns: "is responsible for", summarising: "giving a short version of the main points" } },
  p3: { title: "The shape of a story", level: 2,
    text: "Every memorable story has the same simple shape. First, there is a situation: who is involved and what they want. Then comes a complication, the thing that gets in the way. Finally there is a resolution, what changed and what it taught us. When you explain a project at work, borrow this shape. Start with the goal, describe the obstacle honestly, and finish with the result. Listeners forgive a difficult middle, but they struggle to follow a story that has no ending. If you are not sure how to finish, ask yourself one question: what do I want them to remember tomorrow? Say that sentence last, slowly, and then stop talking.",
    gloss: { complication: "a problem that makes something harder", resolution: "the way a problem or story is settled", obstacle: "something that blocks your way", borrow: "to use an idea that belongs to something else", memorable: "easy to remember" } },
  p4: { title: "Explaining a number", level: 2,
    text: "A number on its own means very little. Saying that revenue grew eleven percent invites the question compared to what. When you present data, give the number a frame. Tell the audience what it was before, what it should have been, and why the change matters. Then say it plainly: sales rose eleven percent, which is twice our forecast, mostly because of returning customers. Notice the order. The headline comes first, the comparison second and the reason third. Resist the urge to read every figure on the slide. Choose the one number you want people to remember, say it slowly, and let the room see you trust it.",
    gloss: { revenue: "the money a company earns", forecast: "a prediction about the future", frame: "context that helps people understand something", resist: "to hold back from doing something", figure: "a number or amount" } },
  p5: { title: "When you are put on the spot", level: 3,
    text: "Being asked a question you did not expect feels like a threat, but it is really an invitation to show how you think. Begin by breathing out and taking a visible pause. Repeat or rephrase the question to buy a few seconds and to make sure you understood it. Then choose a simple structure: give your answer first, add one reason, and support it with a short example. If you do not know, say so calmly and explain how you will find out. Nobody expects you to know everything. They expect you to stay composed, be clear, and take responsibility for the next step.",
    gloss: { composed: "calm and in control", rephrase: "to say something again in different words", invitation: "a polite request to take part", visible: "able to be seen", threat: "a danger or something that feels frightening" } },
  p6: { title: "Speaking with conviction", level: 3,
    text: "Conviction is not volume. It comes from three small habits. First, say fewer words with more certainty: replace maybe we could possibly try with I recommend we try. Second, finish your sentences at a lower pitch, because a rising tone at the end makes a statement sound like a question. Third, hold your position for a moment after you speak instead of rushing to explain yourself. Silence after a clear statement signals that you stand behind it. You can still be open to feedback. Conviction simply means your listeners can tell exactly what you think before they decide whether they agree.",
    gloss: { conviction: "a firm belief that you show with confidence", certainty: "being completely sure", pitch: "how high or low a voice sounds", signals: "shows or communicates", rushing: "hurrying" } },
  p7: { title: "Leading a discussion", level: 4,
    text: "The best discussion leaders talk less than everyone else in the room. Their job is to ask clear questions, protect quieter voices, and keep the group moving toward a decision. When someone makes a point, acknowledge it in a phrase before you respond, for instance, that is a useful concern about cost. When two people disagree, restate each position fairly and ask what evidence would change their mind. If the conversation circles, name it kindly: we have covered this from several angles, so let us decide how to proceed. Finish by confirming the decision aloud, because a decision nobody repeats is a decision nobody remembers.",
    gloss: { acknowledge: "to show you have heard and accepted something", restate: "to say again in a clear way", evidence: "facts that show something is true", circles: "keeps returning to the same point", proceed: "to continue" } },
  p8: { title: "A short vision talk", level: 5,
    text: "People follow a vision they can picture. Begin your talk with the world as it is today, and name a problem your audience already feels. Then describe the world as it could be, using concrete details instead of slogans. Do not say we will transform the customer experience; say a customer will solve a problem in two minutes instead of two days. Finally, make the first step small and specific, so that the future feels reachable. The speaker who ends with a clear request, such as I need your help with one thing this week, will always be more persuasive than the one who ends by saying thank you for listening.",
    gloss: { vision: "a clear picture of what the future could be", concrete: "specific and real, not vague", slogans: "short catchy phrases used in advertising", reachable: "possible to get to", persuasive: "good at convincing people" } }
};

const TOPICS = {
  1: ["Describe your ideal morning from the moment you wake up.", "Explain how to make your favourite meal.", "Tell us about a tool or app you could not work without.", "Describe the best place you have ever visited.", "Explain a hobby to someone who has never tried it."],
  2: ["Explain what you do for work to a ten year old.", "Describe a small win from this week and why it mattered.", "Explain why a team should write things down before a meeting.", "Describe a mistake you learned from.", "Tell us about a person who taught you something important."],
  3: ["Should meetings have a no-laptop rule? Take a side and defend it.", "Make the case for a four day work week.", "What makes a good manager? Give a clear opinion.", "Is it better to be early or perfect? Argue your view.", "Explain a recent decision you made and how you made it."],
  4: ["Pitch a product for people who hate mornings.", "You have two minutes to convince your team to adopt a new process. Go.", "Explain a complicated idea from your field to a new colleague.", "Give a short welcome speech for a new team member.", "Persuade a sceptical manager to approve a small experiment."],
  5: ["Argue the opposite of your own opinion on remote work.", "Deliver a two minute update to leadership on a project that is behind schedule.", "Give a short talk on a lesson that changed how you work.", "Make the case for doing less, but doing it better.", "Present your vision for what your team should look like in a year."]
};

const QUESTIONS = [
  { q: "Why did this project slip?", tip: "Own it, then move forward: say what happened in one sentence, what you changed, and the new date." },
  { q: "Can you explain that in simpler terms?", tip: "Do not repeat yourself louder. Use an analogy or start from the outcome, then add one detail." },
  { q: "What is your recommendation, and why?", tip: "Recommendation first. One reason. One risk you considered. Then stop." },
  { q: "What would you do differently next time?", tip: "Pick one real lesson. Say what you learned, not what went wrong for everyone else." },
  { q: "How much will this cost?", tip: "If you do not know, give a range or say when you will have the exact number. Avoid guessing out loud." },
  { q: "I disagree with that approach. Convince me.", tip: "Thank them, restate their concern in your own words, then answer the concern before defending the plan." },
  { q: "What are the biggest risks?", tip: "Name the top two. For each, say how likely it is and what you will do about it." },
  { q: "Why should we trust these numbers?", tip: "Stay calm. Explain where the data came from and how it was checked. Offer to share the source." },
  { q: "Who is responsible for this?", tip: "Give a name and a date. Vague ownership sounds like no ownership." },
  { q: "We only have a minute. What is the main point?", tip: "Headline first. Then one supporting fact. Offer details after the meeting." },
  { q: "What is the one thing you want us to remember?", tip: "Say it in under twenty words, pause, and repeat it once at a slower pace." },
  { q: "That was not in the plan. How will you handle it?", tip: "Acknowledge the change, state what you will do first, and say when you will report back." }
];

const TOOLKIT = [
  { name: "Pause, Acknowledge, Answer", body: "Take a breath before you speak. Acknowledge the question in a few words, such as 'Good question' or 'That is a fair concern', then answer. The pause is where filler words disappear." },
  { name: "Buy time without filler", body: "Rephrase the question: 'So you are asking whether we can finish by March?' You gain three seconds, and the asker confirms you understood." },
  { name: "When you do not know", body: "Say: 'I do not have that number yet. I will confirm it by Thursday.' Calm honesty with a next step sounds more confident than a guess." },
  { name: "Bridge back to your point", body: "Answer briefly, then bridge: 'And what matters most here is...'. Use it to leave a tangent or a hostile question with your message intact." },
  { name: "Clarify before you answer", body: "If the question is broad, narrow it: 'Do you mean this quarter or long term?' Clear questions get clear answers." },
  { name: "Body language when challenged", body: "Keep your feet planted, hands visible, and your voice slightly slower than normal. Look at the person asking, then at the wider room as you answer." }
];

const FRAMEWORKS = {
  prep: { name: "PREP", title: "Point, Reason, Example, Point",
    body: "State your point first. Give one reason. Support it with a short example. Repeat your point in different words.",
    example: "'We should move the launch to May. The testing team needs two more weeks. Last year we shipped early and spent a month fixing bugs. So May gives us a better launch.'" },
  ppf: { name: "Past, Present, Future", title: "Past, Present, Future",
    body: "Where we were, where we are, where we are going. Ideal for updates, introductions and 'tell me about yourself'.",
    example: "'A year ago we answered tickets by hand. Today a template handles half of them. Next quarter we will automate the rest.'" },
  bluf: { name: "Headline first", title: "Headline first",
    body: "Open with the conclusion. Then give the two or three facts that support it. Busy listeners and senior leaders prefer this order.",
    example: "'We are on track for the deadline. Development is finished, testing is eighty percent done, and the only open risk is the vendor.'" },
  psr: { name: "Problem, Solution, Result", title: "Problem, Solution, Result",
    body: "Describe the problem, explain what you did about it, and give the measurable result. It makes any story sound purposeful.",
    example: "'Customers waited two days for replies. We hired a tier one team and added a help centre. Wait time is now two hours.'" },
  rule3: { name: "Rule of three", title: "The rule of three",
    body: "Group your message into three points. Three feels complete, is easy to remember, and keeps you from rambling.",
    example: "'We need three things: budget, two engineers, and a start date in March.'" }
};

// Learning path. Each unit raises the speaking time and lowers the prep time.
function L(id, kind, title, o) { return Object.assign({ id, kind, title }, o); }
const UNITS = [
  { id: 1, title: "Find your pause", blurb: "Replace filler words with silence. 30 to 45 second answers.", nodes: [
    L("1-1", "read", "Read: Why pauses work", { passage: "p1", intro: { h: "Read aloud, slowly", t: "Read the passage at a steady pace. Breathe at each full stop and leave a clear one second gap. Tap any word you are unsure of to see its meaning." } }),
    L("1-2", "pause", "Pause drill", { topicLevel: 1, targetSec: 30, prepSec: 15, intro: { h: "Silence instead of 'um'", t: "Speak for 30 seconds. Whenever you feel a filler word coming, close your mouth and pause instead. You will be scored on fillers and deliberate pauses." } }),
    L("1-3", "structure", "Structure: PREP", { fw: "prep", topicLevel: 1, targetSec: 45, prepSec: 20 }),
    L("1-4", "read", "Read: Opening a meeting", { passage: "p2", intro: { h: "Lead with confidence", t: "Imagine you are opening a real meeting. Read with purpose and slow down on the example sentence." } }),
    L("1-5", "speak", "Speak: 45 seconds", { topicLevel: 1, targetSec: 45, prepSec: 15, intro: { h: "Your first full topic", t: "Speak for 45 seconds without stopping. Use a clear start, one example and a closing sentence." } }),
    L("1-6", "milestone", "Pause Starter badge", { badge: "pause-starter", blurb: "You finished Unit 1." })
  ]},
  { id: 2, title: "Think in structure", blurb: "Organise ideas as you speak. 60 second answers.", nodes: [
    L("2-1", "read", "Read: The shape of a story", { passage: "p3" }),
    L("2-2", "structure", "Structure: Past, Present, Future", { fw: "ppf", topicLevel: 2, targetSec: 60, prepSec: 15 }),
    L("2-3", "spot", "On the spot", { qs: 1, targetSec: 45, prepSec: 5 }),
    L("2-4", "speak", "Speak: 60 seconds", { topicLevel: 2, targetSec: 60, prepSec: 10 }),
    L("2-5", "read", "Read: Explaining a number", { passage: "p4" }),
    L("2-6", "milestone", "Clear Thinker badge", { badge: "clear-thinker", blurb: "You finished Unit 2." })
  ]},
  { id: 3, title: "On the spot", blurb: "Answer questions you did not plan for. 60 to 90 seconds.", nodes: [
    L("3-1", "spot", "Surprise question", { qs: 1, targetSec: 60, prepSec: 5 }),
    L("3-2", "structure", "Structure: Headline first", { fw: "bluf", topicLevel: 3, targetSec: 60, prepSec: 10 }),
    L("3-3", "read", "Read: When you are put on the spot", { passage: "p5" }),
    L("3-4", "spot", "Tough question", { qs: 1, targetSec: 75, prepSec: 5 }),
    L("3-5", "speak", "Speak: 90 seconds", { topicLevel: 3, targetSec: 90, prepSec: 10 }),
    L("3-6", "milestone", "Quick Thinker badge", { badge: "quick-thinker", blurb: "You finished Unit 3." })
  ]},
  { id: 4, title: "Lead the room", blurb: "Run meetings and persuade. 90 to 120 seconds.", nodes: [
    L("4-1", "read", "Read: Speaking with conviction", { passage: "p6" }),
    L("4-2", "structure", "Structure: Problem, Solution, Result", { fw: "psr", topicLevel: 4, targetSec: 90, prepSec: 10 }),
    L("4-3", "spot", "Hostile question", { qs: 1, targetSec: 90, prepSec: 5 }),
    L("4-4", "read", "Read: Leading a discussion", { passage: "p7" }),
    L("4-5", "speak", "Speak: 2 minutes", { topicLevel: 4, targetSec: 120, prepSec: 5 }),
    L("4-6", "milestone", "Room Leader badge", { badge: "room-leader", blurb: "You finished Unit 4." })
  ]},
  { id: 5, title: "Fearless", blurb: "Hold the floor with no notes. 2 to 3 minutes.", nodes: [
    L("5-1", "structure", "Structure: Rule of three", { fw: "rule3", topicLevel: 5, targetSec: 120, prepSec: 5 }),
    L("5-2", "read", "Read: A short vision talk", { passage: "p8" }),
    L("5-3", "spot", "Back to back questions", { qs: 1, targetSec: 90, prepSec: 0 }),
    L("5-4", "speak", "Speak: 2.5 minutes", { topicLevel: 5, targetSec: 150, prepSec: 0 }),
    L("5-5", "speak", "Speak: 3 minutes", { topicLevel: 5, targetSec: 180, prepSec: 0 }),
    L("5-6", "milestone", "Fillerless badge", { badge: "fillerless", blurb: "You finished the path." })
  ]}
];
const BADGES = {
  "pause-starter": "Pause Starter", "clear-thinker": "Clear Thinker", "quick-thinker": "Quick Thinker", "room-leader": "Room Leader", "fillerless": "Fillerless",
  "streak-3": "3 day streak", "streak-7": "7 day streak", "streak-14": "14 day streak", "streak-30": "30 day streak", "streak-60": "60 day streak", "streak-100": "100 day streak"
};
