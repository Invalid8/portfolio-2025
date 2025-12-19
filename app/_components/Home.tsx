import EditableImage from "@/components/customs/EditableImage";
import Banner from "./Banner";

function Home() {
  return (
    <div>
      <Banner />
      <br />
      <br />
      <div className="next-section min-h-svh items-center justify-center flex">
        <EditableImage
          sectionKey={"ment"}
          fieldKey={"mention"}
          src={"/images/mine.png"}
          collection={"mentee"}
          docId={"mentax"}
          className="max-w-sm"
        />
      </div>
    </div>
  );
}

export default Home;
