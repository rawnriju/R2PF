const QUOTES: string[] = [
  "Remember choom, Never stop fighting!",
  "Brain surgeon, world best. Good instinct!",
  "Good MOOOOOOORNING night city!",
  "Believe it!",
  "What a Save! What a Save! What a Save!",
  "EVERYTHING IS DISCO!"
];

export function getRandomQuote(): string {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
