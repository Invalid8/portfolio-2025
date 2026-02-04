import ContentSpan from "@/components/customs/ContentEditSpan";

function Footer() {
  return (
    <div className="py-8 border-t border-neutral-800 text-right px-8 text-neutral-500 text-sm">
      <p>
        © {new Date().getFullYear()}{" "}
        <ContentSpan sectionKey="navbar" fieldKey="logo">
          dalgoridim
        </ContentSpan>
        . All rights reserved.
      </p>
    </div>
  );
}

export default Footer;
