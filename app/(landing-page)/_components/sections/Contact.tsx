"use client";

import ContentSpan from "@/components/customs/ContentEditSpan";
import { usePageContext } from "@/lib/context/PageContent";
import { useState } from "react";
import {
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SendIcon,
  Loader2Icon,
} from "lucide-react";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/constants";
import { toast } from "sonner";

export default function Contact() {
  const { sections } = usePageContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const contactSection = sections["portfolio"]?.["contact"] || {
    id: "contact",
    collection: "portfolio",
    title: "LET'S WORK TOGETHER",
    subtitle:
      "Have a project in mind? Let's discuss how we can work together to bring your ideas to life.",
    email: "b.fadamitan2019@gmail.com",
    phone: "+234 703 4797 467",
    location: "Lagos, Nigeria",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/b.fadamitan2019@gmail.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formData.message,
            _subject: `New Portfolio Contact from ${formData.name}`,
            _template: "table",
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Message sent successfully! I'll get back to you soon.");
        setFormData({ name: "", email: "", message: "" });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        "Failed to send message. Please try again or email me directly.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section
      id="Contact"
      className="w-full py-20 sm:px-5 px-3 md:px-10 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="relative">
                <h2 className="text-4xl lg:text-6xl font-bold">
                  <ContentSpan sectionKey="contact" fieldKey="title">
                    {contactSection?.title}
                  </ContentSpan>
                </h2>
              </div>
              <p className="text-lg text-neutral-400 max-w-xl">
                <ContentSpan sectionKey="contact" fieldKey="subtitle">
                  {contactSection?.subtitle}
                </ContentSpan>
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <ContactItem
                icon={<MailIcon className="w-5 h-5" />}
                label="Email"
                value={contactSection?.email}
                href={`mailto:${contactSection?.email}`}
                sectionKey="contact"
                fieldKey="email"
              />
              <ContactItem
                icon={<PhoneIcon className="w-5 h-5" />}
                label="Phone"
                value={contactSection?.phone}
                href={`tel:${contactSection?.phone.replace(/\s+/g, "")}`}
                sectionKey="contact"
                fieldKey="phone"
              />
              <ContactItem
                icon={<MapPinIcon className="w-5 h-5" />}
                label="Location"
                value={contactSection?.location}
                sectionKey="contact"
                fieldKey="location"
              />
            </div>

            <div className="pt-6 border-t border-neutral-800">
              <p className="text-sm text-neutral-500 mb-4">Follow me on</p>
              <div className="flex gap-4">
                {SOCIAL_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.link}
                    target="_blank"
                    className="w-12 h-12 rounded-full bg-neutral-800/50 backdrop-blur border border-neutral-700/50 hover:bg-primary hover:border-primary flex items-center justify-center transition-all hover:scale-110 font-mono font-medium"
                    title={link.name}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/30 backdrop-blur border border-neutral-700/50 rounded-2xl p-8 lg:p-10 hover:border-primary/30 transition-all">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2 text-neutral-300"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-700 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2 text-neutral-300"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-700 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2 text-neutral-300"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-700 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Tell me about your project..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 font-medium hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <SendIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
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
    <div className="flex items-start gap-4 group cursor-pointer p-4 rounded-xl bg-neutral-800/20 backdrop-blur border border-neutral-700/30 hover:border-primary/50 hover:bg-neutral-800/40 transition-all">
      <div className="p-3 bg-neutral-800/50 rounded-lg group-hover:bg-primary transition-colors">
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
