import type { Metadata } from "next";
import { PatternVisual } from "../../_components/PatternVisual";

export const metadata: Metadata = {
  title: "Player Guide",
  description:
    "Learn how to join games, understand your ticket, and claim prizes in Tambola.",
};

export default function PlayerGuidePage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Player Guide</h1>
      <p className="lead">
        Welcome to Tambola! This guide covers everything you need to
        know to join games, understand your ticket, and claim prizes.
      </p>

      {/* Joining a Game Section */}
      <section id="joining">
        <h2>Joining a Game</h2>
        <p>There are two ways to join a Tambola game:</p>

        <h3>Via Direct Link</h3>
        <p>
          The host will share a direct link with you. Simply click the
          link, enter your nickname, and you&apos;ll join the game
          lobby automatically.
        </p>

        <h3>Via Game Code</h3>
        <p>
          If the host gives you a 6-digit code, follow these steps:
        </p>
        <ol>
          <li>
            Go to the <strong>/join</strong> page on the Tambola
            website
          </li>
          <li>Enter the 6-digit game code (e.g., ABC123)</li>
          <li>
            Enter your nickname (this is what other players will see)
          </li>
          <li>Click &quot;Join Game&quot;</li>
        </ol>
        <p>
          <em>
            Note: You cannot join a game that has already started.
            Make sure to join before the host clicks &quot;Start
            Game&quot;.
          </em>
        </p>
      </section>

      {/* Understanding Your Ticket Section */}
      <section id="ticket">
        <h2>Understanding Your Ticket</h2>
        <p>
          Your Tambola ticket is the heart of the game. Here&apos;s
          what you need to know:
        </p>

        <h3>Ticket Layout</h3>
        <ul>
          <li>
            <strong>3 rows × 9 columns</strong> - Your ticket is a
            grid
          </li>
          <li>
            <strong>15 numbers total</strong> - Each ticket contains
            exactly 15 numbers
          </li>
          <li>
            <strong>5 numbers per row</strong> - Each row has exactly
            5 numbers and 4 empty spaces
          </li>
        </ul>

        <h3>Column Ranges</h3>
        <p>Numbers are organized by columns based on their value:</p>
        <ul>
          <li>Column 1: Numbers 1-9</li>
          <li>Column 2: Numbers 10-19</li>
          <li>Column 3: Numbers 20-29</li>
          <li>Column 4: Numbers 30-39</li>
          <li>Column 5: Numbers 40-49</li>
          <li>Column 6: Numbers 50-59</li>
          <li>Column 7: Numbers 60-69</li>
          <li>Column 8: Numbers 70-79</li>
          <li>Column 9: Numbers 80-90</li>
        </ul>
        <p>
          <em>
            Tip: Knowing the column ranges helps you quickly find
            numbers when they&apos;re called!
          </em>
        </p>
      </section>

      {/* Prize Patterns Section */}
      <section id="patterns">
        <h2>Prize Patterns</h2>
        <p>
          You win prizes by completing patterns on your ticket. The
          host decides which patterns are active for each game. Here
          are all the possible patterns:
        </p>

        <div className="not-prose grid gap-4 my-6">
          <PatternVisual
            pattern="EARLY_FIVE"
            title="Early Five"
            description="Be the first to mark any 5 numbers on your ticket. The quickest pattern to complete!"
          />

          <PatternVisual
            pattern="TOP_ROW"
            title="Top Row"
            description="Complete all 5 numbers in the first row of your ticket."
          />

          <PatternVisual
            pattern="MIDDLE_ROW"
            title="Middle Row"
            description="Complete all 5 numbers in the middle row of your ticket."
          />

          <PatternVisual
            pattern="BOTTOM_ROW"
            title="Bottom Row"
            description="Complete all 5 numbers in the bottom row of your ticket."
          />

          <PatternVisual
            pattern="FOUR_CORNERS"
            title="Four Corners"
            description="Mark the first and last numbers of both the top and bottom rows (4 numbers total)."
          />

          <PatternVisual
            pattern="FULL_HOUSE"
            title="Full House"
            description="Complete all 15 numbers on your ticket. This ends the game!"
          />
        </div>

        <p>
          <strong>Important:</strong> Full House always ends the game.
          Once someone claims Full House, the game is complete and
          final scores are displayed.
        </p>
      </section>

      {/* Marking Numbers Section */}
      <section id="marking">
        <h2>Marking Numbers</h2>
        <p>
          When numbers are called, you need to mark them on your
          ticket.
        </p>

        <h3>How to Mark</h3>
        <ol>
          <li>Listen/watch for the called number</li>
          <li>
            Find it on your ticket (remember the column ranges!)
          </li>
          <li>Tap or click the number to mark it</li>
          <li>
            The number will be highlighted to show it&apos;s marked
          </li>
        </ol>

        <h3>Important Notes</h3>
        <ul>
          <li>
            <strong>Manual marking only</strong> - Numbers are NOT
            auto-marked. You must tap each number yourself.
          </li>
          <li>
            <strong>Use the history bar</strong> - If you missed a
            number, check the called numbers history at the top/side
            of your screen.
          </li>
          <li>
            <strong>Stay focused</strong> - Keep your eyes on both
            your ticket and the called numbers!
          </li>
        </ul>
      </section>

      {/* Making Claims Section */}
      <section id="claims">
        <h2>Making Claims</h2>
        <p>
          When you complete a pattern, you need to claim it to win
          points!
        </p>

        <h3>How to Claim</h3>
        <ol>
          <li>Complete a pattern by marking all required numbers</li>
          <li>
            Tap the <strong>&quot;Claim&quot;</strong> button on your
            screen
          </li>
          <li>
            Select which pattern you&apos;re claiming (if multiple
            patterns are active)
          </li>
          <li>The system will verify your claim automatically</li>
        </ol>

        <h3>Claim Verification</h3>
        <p>
          <strong>Valid Claims:</strong> If you&apos;ve marked all
          required numbers and they&apos;ve been called, you win!
          Points are awarded immediately.
        </p>
        <p>
          <strong>Invalid Claims:</strong> If you claim before
          completing the pattern, you&apos;ll see an error message.
          Don&apos;t worry - you can try again once you&apos;ve
          actually completed the pattern.
        </p>

        <h3>Tiered Prizes</h3>
        <p>
          Most patterns allow multiple winners with decreasing points:
        </p>
        <ul>
          <li>1st place: Full points</li>
          <li>2nd place: Fewer points</li>
          <li>3rd place: Even fewer points</li>
        </ul>
        <p>
          <em>
            This means even if someone claims before you, you can
            still win points!
          </em>
        </p>
      </section>

      {/* Tips for Winning Section */}
      <section id="tips">
        <h2>Tips for Winning</h2>
        <p>
          Want to improve your Tambola game? Here are some pro tips:
        </p>

        <ul>
          <li>
            <strong>Know Your Ticket</strong> - Before the game
            starts, spend a moment looking at your numbers and their
            positions.
          </li>
          <li>
            <strong>Use Column Ranges</strong> - When you hear a
            number, quickly determine which column it belongs to
            (e.g., 47 is in column 5).
          </li>
          <li>
            <strong>Watch the History</strong> - If you join late or
            get distracted, check the called numbers history.
          </li>
          <li>
            <strong>Claim Quickly</strong> - First-come-first-served!
            If you complete a pattern, claim immediately.
          </li>
          <li>
            <strong>Track Multiple Patterns</strong> - Keep an eye on
            your progress toward different patterns. You might be
            close to more than one!
          </li>
          <li>
            <strong>Stay Calm</strong> - If you miss a number,
            don&apos;t panic. Check the history and mark it before the
            next call.
          </li>
        </ul>

        <h3>Common Mistakes to Avoid</h3>
        <ul>
          <li>
            <strong>Claiming too early</strong> - Make sure ALL
            required numbers are marked before claiming
          </li>
          <li>
            <strong>Missing called numbers</strong> - Stay focused,
            especially in fast-paced games
          </li>
          <li>
            <strong>Forgetting to mark</strong> - Always tap to mark,
            numbers don&apos;t auto-mark!
          </li>
          <li>
            <strong>Late claims</strong> - Claim as soon as you
            complete a pattern for maximum points
          </li>
        </ul>
      </section>

      {/* Game Rules Section */}
      <section>
        <h2>Game Rules Summary</h2>
        <ul>
          <li>Numbers 1-90 are called randomly, one at a time</li>
          <li>Each player gets a unique ticket with 15 numbers</li>
          <li>Mark your numbers manually when they&apos;re called</li>
          <li>Claim patterns as you complete them to earn points</li>
          <li>Game ends when someone claims Full House</li>
          <li>Highest total points wins overall!</li>
        </ul>

        <p>
          <strong>Ready to play?</strong> Join a game and have fun! 🎉
        </p>
      </section>
    </article>
  );
}
