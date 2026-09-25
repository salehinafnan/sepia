const Section = ({ title, children }) => (
  <section className="mt-8">
    <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
    <div className="mt-2 space-y-3 text-stone-600 dark:text-stone-300">
      {children}
    </div>
  </section>
);

const Term = ({ children }) => (
  <strong className="font-medium text-stone-900 dark:text-stone-100">
    {children}
  </strong>
);

const Privacy = () => (
  <article className="mx-auto max-w-2xl leading-relaxed">
    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
      Privacy policy
    </h1>
    <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
      Last updated September 25, 2026
    </p>
    <p className="mt-6 text-stone-600 dark:text-stone-300">
      Sepia is a personal project for sharing photos and moments. This page
      explains what it stores about you, why, and what you can do about it.
    </p>

    <Section title="What Sepia stores">
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <Term>Your account:</Term> your name and email address. If you sign up
          with a password, Sepia stores a secure hash of it, never the password
          itself.
        </li>
        <li>
          <Term>Google sign-in:</Term> if you sign in with Google, Google shares
          your name, email address, profile picture and Google account ID with
          Sepia. Sepia gets no other access to your Google account.
        </li>
        <li>
          <Term>Your posts:</Term> the title, caption, tags and photo you share,
          when you shared them, and which posts you like.
        </li>
      </ul>
    </Section>

    <Section title="How it's used">
      <p>
        Only to run Sepia: to sign you in, show your posts under your name and
        count likes. Your data isn't sold or shared with anyone, and Sepia has
        no ads, analytics or tracking.
      </p>
    </Section>

    <Section title="What others can see">
      <p>
        Your posts, your name as their author and how many likes they have are
        public. Your email address and profile picture are never shown to other
        people.
      </p>
    </Section>

    <Section title="Where it's kept">
      <p>
        Sepia is hosted on Render and keeps its data in a MongoDB Atlas
        database. Your browser stores your sign-in session and theme choice.
        Sepia itself doesn't set cookies, although Google may set its own when
        you sign in with Google. Your IP address is used briefly to protect
        against abuse, such as repeated failed sign-ins, and isn't saved.
      </p>
    </Section>

    <Section title="Your choices">
      <p>
        You can edit or delete your posts at any time, and signing out removes
        your session from your browser. To delete your account and everything
        linked to it, or to ask a question, contact the owner through{" "}
        <a
          href="https://github.com/salehinafnan/sepia"
          className="font-medium text-stone-900 underline underline-offset-4 dark:text-stone-100"
        >
          Sepia on GitHub
        </a>
        .
      </p>
    </Section>
  </article>
);

export default Privacy;
