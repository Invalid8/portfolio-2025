import ContentSpan from "@/components/customs/ContentEditSpan";
import EditableImage from "@/components/customs/EditableImage";

export default function About() {
  return (
    <section
      id="About"
      className="min-h-svh grid lg:grid-cols-2 items-center justify-center p-10 gap-12 lg:gap-16 relative overflow-hidden"
    >
      <div className="relative flex items-center justify-center lg:min-h-svh">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-3xl"></div>
        <EditableImage
          sectionKey={"about"}
          fieldKey={"aboutImg"}
          src={"/images/AstronutCat.svg"}
          collection={"portfolio"}
          docId={"images"}
          className="relative z-10 max-w-lg w-full lg:pt-30 xl:pl-10 transition-transform hover:scale-105 duration-500"
        />
      </div>

      <div className="space-y-6 flex flex-col justify-center h-full lg:pl-10">
        <div className="space-y-8 max-w-3xl">
          <div className="relative">
            <h2 className="text-4xl lg:text-5xl font-bold">ABOUT ME</h2>
          </div>

          <div className="space-y-6">
            <p className="text-lg md:text-xl text-pretty leading-relaxed lg:leading-[1.9] tracking-wide text-neutral-300">
              <ContentSpan sectionKey={"about"} fieldKey={"leading1"}>
                I am a Frontend Developer based in Nigeria with a strong
                foundation in Computer Science. I specialize in building
                accessible and user-friendly web applications, with a particular
                focus on React.js, React Native, Next.js, and TypeScript.
                Passionate about solving complex problems.
              </ContentSpan>
            </p>

            <p className="text-lg md:text-xl text-pretty leading-relaxed lg:leading-[1.9] tracking-wide text-neutral-300">
              <ContentSpan sectionKey={"about"} fieldKey={"leading2"}>
                When I&apos;m not coding, I enjoy gaming, playing Mobile
                Legends, and diving into new technologies to stay ahead in my
                field. Always curious and eager to learn, I aim to create
                impactful solutions through technology.
              </ContentSpan>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="bg-neutral-800/30 backdrop-blur border border-neutral-700/50 rounded-xl p-4 hover:border-primary/30 transition-all">
              <div className="text-3xl font-bold text-primary mb-1">5+</div>
              <div className="text-sm text-neutral-400">Years Experience</div>
            </div>
            <div className="bg-neutral-800/30 backdrop-blur border border-neutral-700/50 rounded-xl p-4 hover:border-primary/30 transition-all">
              <div className="text-3xl font-bold text-primary mb-1">20+</div>
              <div className="text-sm text-neutral-400">Projects Completed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
