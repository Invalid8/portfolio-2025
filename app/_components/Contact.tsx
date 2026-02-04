"use client";

import ContentSpan from "@/components/customs/ContentEditSpan";
import { usePageContext } from "@/lib/context/PageContent";
import { useEffect } from "react";
import { MailIcon, MapPinIcon, PhoneIcon, SendIcon } from "lucide-react";
import Link from "next/link";

const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/Invalid8",
    icon: "GH",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/daniel-fadamitan-a08052247",
    icon: "LI",
  },
  {
    name: "Twitter",
    url: "https://x.com/D_Invalid1",
    icon: "X",
  },
];

function Contact() {
  const { setSection } = usePageContext();

  useEffect(() => {
    setSection("contact", {
      id: "contact",
      collection: "portfolio",
      title: "LET'S WORK TOGETHER",
      subtitle:
        "Have a project in mind? Let's discuss how we can work together to bring your ideas to life.",
      email: "b.fadamitan2019@gmail.com",
      phone: "+234 703 4797 467",
      location: "Lagos, Nigeria",
    });
  }, [setSection]);

  return (
    <div id="Contact" className="w-full py-20 px-5 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-6xl font-bold">
                <ContentSpan sectionKey="contact" fieldKey="title">
                  LET&apos;S WORK TOGETHER
                </ContentSpan>
              </h2>
              <p className="text-lg text-neutral-400 max-w-xl">
                <ContentSpan sectionKey="contact" fieldKey="subtitle">
                  Have a project in mind? Let&apos;s discuss how we can work
                  together to bring your ideas to life.
                </ContentSpan>
              </p>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-4">
              <ContactItem
                icon={<MailIcon className="w-5 h-5" />}
                label="Email"
                value="b.fadamitan2019@gmail.com"
                href="mailto:b.fadamitan2019@gmail.com"
                sectionKey="contact"
                fieldKey="email"
              />
              <ContactItem
                icon={<PhoneIcon className="w-5 h-5" />}
                label="Phone"
                value="+234 703 4797 467"
                href="tel:+2347034797467"
                sectionKey="contact"
                fieldKey="phone"
              />
              <ContactItem
                icon={<MapPinIcon className="w-5 h-5" />}
                label="Location"
                value="Lagos, Nigeria"
                sectionKey="contact"
                fieldKey="location"
              />
            </div>

            {/* Social Links */}
            <div className="pt-6 border-t border-neutral-800">
              <p className="text-sm text-neutral-500 mb-4">Follow me on</p>
              <div className="flex gap-4">
                {socialLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    className="w-12 h-12 rounded-full bg-neutral-800 hover:bg-primary flex items-center justify-center transition-all hover:scale-110 font-mono font-medium"
                    title={link.name}
                  >
                    {link.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="bg-neutral-800/50 backdrop-blur border border-neutral-700/50 rounded-2xl p-8 lg:p-10">
            <form className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-700 rounded-lg focus:border-primary focus:outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-700 rounded-lg focus:border-primary focus:outline-none transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-700 rounded-lg focus:border-primary focus:outline-none transition-colors resize-none"
                    placeholder="Tell me about your project..."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                Send Message
                <SendIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
      </div>
    </div>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
  sectionKey,
  fieldKey,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  sectionKey: string;
  fieldKey: string;
}) {
  const content = (
    <div className="flex items-start gap-4 group cursor-pointer">
      <div className="p-3 bg-neutral-800 rounded-lg group-hover:bg-primary transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-sm text-neutral-500 mb-1">{label}</p>
        <p className="text-neutral-200 group-hover:text-primary transition-colors">
          <ContentSpan sectionKey={sectionKey} fieldKey={fieldKey}>
            {value}
          </ContentSpan>
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} target="_blank">
        {content}
      </Link>
    );
  }

  return content;
}

export default Contact;
