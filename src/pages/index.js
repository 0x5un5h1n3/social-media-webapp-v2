import PostForm from "../components/PostForm";
import PostsList from "../components/PostsList";

const Home = () => {
  return (
    <div>
      <h1>Welcome!</h1>
      <PostForm />
      <PostsList />
    </div>
  );
};

export default Home;
