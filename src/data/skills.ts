export interface SkillInfo {
  name: string;
  icon: string;
  href: string;
  bg?: string;
  image: string;
}

export const skills: SkillInfo[] = [
  {
    name: "JavaScript",
    icon: "js",
    href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    bg: "#ecdb4f",
    image: "/images/js.png",
  },
  {
    name: "HTML",
    icon: "html",
    href: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    bg: "#d55125",
    image: "/images/html.png",
  },
  {
    name: "CSS",
    icon: "css",
    href: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    bg: "#3076bd",
    image: "/images/css.png",
  },
  {
    name: "Docker",
    icon: "docker",
    href: "https://www.docker.com/",
    bg: "#4793eb",
    image: "/images/docker.png",
  },
  {
    name: "Node.js",
    icon: "nodejs",
    href: "https://nodejs.org/en/",
    image: "/images/nodejs.png",
  },
  {
    name: "GitHub",
    icon: "github",
    href: "https://github.com/",
    image: "/images/github.png",
  },
  {
    name: "Python",
    icon: "python",
    href: "https://www.python.org/",
    image: "/images/python.png",
  },
  {
    name: "Linux Systems",
    icon: "linux",
    href: "https://www.linux.org/",
    image: "/images/linux.png",
  },
  {
    name: "MySQL",
    icon: "mysql",
    href: "https://www.mysql.com/",
    image: "/images/mysql.png",
  },
  {
    name: "PowerShell",
    icon: "powershell",
    href: "https://docs.microsoft.com/en-us/powershell/",
    image: "/images/powershell.png",
  },
  {
    name: "Bash",
    icon: "bash",
    href: "https://www.gnu.org/software/bash/",
    image: "/images/bash.png",
  },
  {
    name: "Git",
    icon: "git",
    href: "https://git-scm.com/",
    image: "/images/git.png",
  },
  {
    name: "GitLab",
    icon: "gitlab",
    href: "https://about.gitlab.com/",
    image: "/images/gitlab.png",
  },
  // Add the missing skills and images here
  {
    name: "FreeBSD",
    icon: "freebsd",
    href: "https://www.freebsd.org/",
    image: "/images/freebsd.png",
  },
  {
    name: "DNS Servers",
    icon: "dns",
    href: "https://en.wikipedia.org/wiki/Domain_Name_System",
    image: "/images/dns.png",
  },
  {
    name: "Elastic Stack",
    icon: "elasticstack",
    href: "https://www.elastic.co/",
    image: "/images/elasticstack.png",
  },
];
