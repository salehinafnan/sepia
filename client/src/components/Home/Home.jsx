import Posts from "../Posts/Posts";

const Home = () => (
  <>
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Latest moments
      </h1>
      <p className="mt-1.5 text-stone-500 dark:text-stone-400">
        Photos and stories from the Sepia community.
      </p>
    </div>
    <Posts />
  </>
);

export default Home;
