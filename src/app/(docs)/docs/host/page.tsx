import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Host Guide",
  description:
    "Learn how to create, customize, and manage Tambola games as a host.",
};

export default function HostGuidePage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Host Guide</h1>
      <p className="lead">
        Everything you need to know about creating and managing
        Tambola games for your friends, family, or community.
      </p>

      {/* Getting Started Section */}
      <section id="getting-started">
        <h2>Getting Started</h2>
        <p>
          Before you can host a Tambola game, you&apos;ll need to
          create an account. Here&apos;s how to get started:
        </p>
        <ol>
          <li>
            <strong>Create an Account</strong> - Sign up with your
            email address and password. No social login required!
          </li>
          <li>
            <strong>Navigate to Dashboard</strong> - Once logged in,
            you&apos;ll see your host dashboard with all your games.
          </li>
          <li>
            <strong>Click &quot;Create Game&quot;</strong> - Start
            setting up your first Tambola game.
          </li>
        </ol>
      </section>

      {/* Creating a Game Section */}
      <section id="creating-a-game">
        <h2>Creating a Game</h2>
        <p>Creating a game is quick and easy. Follow these steps:</p>

        <h3>Step 1: Enter Game Title</h3>
        <p>
          Give your game a memorable name. This helps players identify
          your game when they join. Examples:
        </p>
        <ul>
          <li>&quot;Family Sunday Tambola&quot;</li>
          <li>&quot;Office Diwali Party&quot;</li>
          <li>&quot;Friends Quiz Night Tambola&quot;</li>
        </ul>

        <h3>Step 2: Configure Options</h3>
        <p>
          Customize your game settings to match your preferences. See
          the <a href="#customization">Customization</a> section below
          for details.
        </p>

        <h3>Step 3: Create the Game</h3>
        <p>
          Click the &quot;Create Game&quot; button to finalize your
          game. You&apos;ll receive a unique game code and shareable
          link.
        </p>
      </section>

      {/* Customization Section */}
      <section id="customization">
        <h2>Customizing Your Game</h2>
        <p>Make each game unique by configuring these options:</p>

        <h3>Prize Patterns</h3>
        <p>
          Select which patterns players can claim. Each pattern awards
          points when completed:
        </p>
        <ul>
          <li>
            <strong>Early Five</strong> - First player to mark any 5
            numbers
          </li>
          <li>
            <strong>Top Row</strong> - Complete all 5 numbers in the
            first row
          </li>
          <li>
            <strong>Middle Row</strong> - Complete all 5 numbers in
            the middle row
          </li>
          <li>
            <strong>Bottom Row</strong> - Complete all 5 numbers in
            the bottom row
          </li>
          <li>
            <strong>Four Corners</strong> - Mark the first and last
            numbers of top and bottom rows
          </li>
          <li>
            <strong>Full House</strong> - Complete all 15 numbers on
            your ticket (ends the game!)
          </li>
        </ul>

        <h3>Point Values</h3>
        <p>
          For each pattern, you can set different point values for
          1st, 2nd, and 3rd place. For example:
        </p>
        <ul>
          <li>1st place: 100 points</li>
          <li>2nd place: 50 points</li>
          <li>3rd place: 25 points</li>
        </ul>

        <h3>Number Call Interval</h3>
        <p>Choose how fast numbers are called:</p>
        <ul>
          <li>
            <strong>7 seconds</strong> - Fast-paced, for experienced
            players
          </li>
          <li>
            <strong>10 seconds</strong> - Normal pace, recommended for
            most games
          </li>
          <li>
            <strong>15 seconds</strong> - Relaxed pace, good for
            beginners
          </li>
        </ul>

        <h3>Player Limits</h3>
        <p>Set the minimum and maximum number of players:</p>
        <ul>
          <li>
            <strong>Minimum</strong>: 2 players (required to start)
          </li>
          <li>
            <strong>Maximum</strong>: Up to 75 players per game
          </li>
        </ul>
      </section>

      {/* Sharing Section */}
      <section id="sharing">
        <h2>Sharing Your Game</h2>
        <p>
          Once your game is created, share it with players using one
          of these methods:
        </p>

        <h3>Shareable Link</h3>
        <p>
          Copy the direct link and share it via WhatsApp, email, or
          any messaging app. Players can click the link to join
          directly.
        </p>

        <h3>6-Digit Game Code</h3>
        <p>Share the game code verbally or in text. Players can:</p>
        <ul>
          <li>
            Visit the <strong>/join</strong> page on the website
          </li>
          <li>Enter the 6-digit code</li>
          <li>Provide their nickname and join the game</li>
        </ul>
        <p>
          <em>
            Tip: The game code is shown prominently on your host
            dashboard for easy reference.
          </em>
        </p>
      </section>

      {/* Managing Gameplay Section */}
      <section id="managing">
        <h2>Managing Gameplay</h2>
        <p>
          As the host, you control when the game starts and monitor
          progress.
        </p>

        <h3>Waiting in Lobby</h3>
        <p>
          After creating a game, you&apos;ll enter the lobby. Wait
          until the minimum number of players have joined before
          starting.
        </p>

        <h3>Starting the Game</h3>
        <p>
          When you&apos;re ready, click the{" "}
          <strong>&quot;Start Game&quot;</strong> button. Once
          started:
        </p>
        <ul>
          <li>
            Numbers are called automatically at your configured
            interval
          </li>
          <li>New players cannot join mid-game</li>
          <li>The game runs until Full House is claimed</li>
        </ul>

        <h3>Monitoring Progress</h3>
        <p>As host, you can see:</p>
        <ul>
          <li>All called numbers in the history bar</li>
          <li>Live leaderboard with current scores</li>
          <li>Claim announcements as they happen</li>
        </ul>

        <h3>Handling Claims</h3>
        <p>
          When a player makes a claim, the system automatically
          verifies it. If valid, points are awarded immediately.
          Invalid claims show an error to the player.
        </p>
      </section>

      {/* Game Completion Section */}
      <section id="completion">
        <h2>Game Completion</h2>
        <p>
          The game ends when a player successfully claims Full House.
        </p>

        <h3>Final Results</h3>
        <p>
          All players see the final leaderboard showing total points
          earned. Results are automatically saved to your game
          history.
        </p>

        <h3>Viewing History</h3>
        <p>
          Access completed games from your dashboard. You can see:
        </p>
        <ul>
          <li>List of all games you&apos;ve hosted</li>
          <li>Final scores and winners</li>
          <li>When each game was played</li>
        </ul>

        <h3>Force Stop (Host Only)</h3>
        <p>
          If needed, you can end a game early using the &quot;End
          Game&quot; button. This is useful if players need to leave
          unexpectedly.
        </p>
      </section>

      {/* Tips Section */}
      <section>
        <h2>Tips for Hosting</h2>
        <ul>
          <li>
            <strong>Test First</strong> - Create a test game with a
            friend to learn the flow before hosting a larger event.
          </li>
          <li>
            <strong>Choose the Right Interval</strong> - For
            beginners, use 15 seconds. For experienced players, 7-10
            seconds keeps things exciting.
          </li>
          <li>
            <strong>Communicate Rules</strong> - Before starting,
            remind players about the patterns in play and how claiming
            works.
          </li>
          <li>
            <strong>Have Fun!</strong> - Tambola is a social game.
            Enjoy the excitement of each call and celebrate the
            winners!
          </li>
        </ul>
      </section>
    </article>
  );
}
