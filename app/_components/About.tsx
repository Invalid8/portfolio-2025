import ContentSpan from "@/components/customs/ContentEditSpan";
import EditableImage from "@/components/customs/EditableImage";

function About() {
  return (
    <div
      id="About"
      className="min-h-svh grid lg:grid-cols-2 md:items-center md:justify-center p-10"
    >
      <div className="next-section items-center justify-center flex relative lg:min-h-svh">
        <EditableImage
          sectionKey={"about"}
          fieldKey={"aboutImg"}
          src={"/images/AstronutCat.svg"}
          collection={"portfolio"}
          docId={"images"}
          className="max-w-8xl lg:pt-30 xl:pl-10 pl-10"
        />
      </div>
      <div className="space-y-5 flex-1 flex flex-col justify-center h-full lg:pl-10">
        <div className="space-y-6 lg:space-y-7 max-w-3xl">
          <h2 className="text-4xl lg:text-5xl font-bold">ABOUT ME</h2>
          <div className="description space-y-6">
            <p className="text-lg md:text-xl text-pretty text-justify leading-relaxed lg:leading-[1.9] tracking-wider">
              <ContentSpan sectionKey={"about"} fieldKey={"leading1"}>
                I am a Frontend Developer based in Nigeria with a strong
                foundation in Computer Science. I specialize in building
                accessible and user-friendly web a-pplications, with a
                particular focus on React.js, React Native, Next.js, and
                TypeScript. Passionate about solving complex problems.
              </ContentSpan>
            </p>
            <p className="text-lg md:text-xl text-pretty text-justify leading-relaxed lg:leading-[1.9] tracking-wider">
              <ContentSpan sectionKey={"about"} fieldKey={"leading2"}>
                When I&apos;m not coding, I enjoy gaming, playing Mobile
                Legends, and diving into new technologies to stay ahead in my
                field. Always curious and eager to learn, I aim to create
                impactful solutions through technology.
              </ContentSpan>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
