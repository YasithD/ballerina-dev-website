import fs from "fs";
import matter from "gray-matter";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Container, Col } from "react-bootstrap";
import MarkdownNavbar from "markdown-navbar";
import Image from "next-image-export-optimizer";
import rehypeRaw from "rehype-raw";
import Head from "next/head";

import { getHighlighter, setCDN } from "shiki";

setCDN("https://unpkg.com/shiki/");

import Layout from "../../../layouts/LayoutDocs";
import LeftNav from "../../../components/common/left-nav/LeftNav";
import { prefix } from "../../../utils/prefix";

var traverseFolder = function (dir) {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach(function (file) {
    var filex = dir + "/" + file;
    var stat = fs.statSync(filex);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(traverseFolder(filex));
    } else {
      /* Is a file */
      filex = filex.replace(/swan-lake\/get-started\//g, "");
      results.push(filex);
    }
  });
  return results;
};

export async function getStaticPaths() {
  // Retrieve all our slugs
  const files = traverseFolder("swan-lake/get-started");
  const paths = files.map((fileName) => ({
    params: {
      slug: fileName.replace(".md", "").split("/"),
    },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const id = slug[slug.length - 1];
  slug = slug.join("/");
  const fileName = fs.readFileSync(`swan-lake/get-started/${slug}.md`, "utf-8");
  const { data: frontmatter, content } = matter(fileName);
  // const source = {source:'learn'};
  return {
    props: {
      frontmatter,
      content,
      id,
    },
  };
}

export default function PostPage({ frontmatter, content, id }) {
  const ShowCode = (code, language) => {
    const [codeSnippet, setCodeSnippet] = React.useState([]);

    React.useEffect(() => {
      async function fetchData() {
        getHighlighter({
          theme: "css-variables",
          langs: [
            "bash",
            "ballerina",
            "toml",
            "yaml",
            "sh",
            "json",
            "graphql",
            "sql",
          ],
        }).then((highlighter) => {
          setCodeSnippet(highlighter.codeToHtml(code, { lang }));
        });
      }
      fetchData();
    }, [code, language]);
    return [codeSnippet];
  };

  return (
    <>
      <Head>
        <meta name="description" content={frontmatter.description} />
        <meta name="keywords" content={frontmatter.keywords} />

        <title>{frontmatter.title}</title>

        {/* <!--FB--> */}
        <meta property="og:type" content="article" />
        <meta
          property="og:title"
          content={`Ballerina - ${frontmatter.title}`}
        />
        <meta
          property="og:description"
          content={frontmatter.description}
        ></meta>

        {/* <!--LINKED IN  --> */}
        <meta property="og:description" content={frontmatter.description} />

        {/* <!--TWITTER--> */}
        <meta
          property="twitter:description"
          content={frontmatter.description}
        />
        <meta
          property="twitter:text:description"
          content={frontmatter.description}
        />
      </Head>
      <Layout>
        <Col sm={3} xxl={2} className="leftNav d-none d-sm-block">
          <LeftNav launcher="learn" id={id} />
        </Col>
        <Col xs={12} className="d-block d-sm-none">
          Mobile Left Nav
        </Col>
        <Col xs={12} sm={7} xxl={8} className="mdContent">
          <Container>
            <div className="topRow">
              <Col xs={11}>
                <h1>{frontmatter.title}</h1>
              </Col>
              <Col xs={1} className="gitIcon">
                <Image
                  src={`${prefix}/images/github.svg`}
                  height={20}
                  width={20}
                  alt="Edit in github"
                />
              </Col>
            </div>

            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: ShowCode(
                          String(children).replace(/\n$/, ""),
                          match[1].toLowerCase()
                        ),
                      }}
                    />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
              rehypePlugins={[rehypeRaw]}
            >
              {content}
            </ReactMarkdown>

            <div className="contentNav">
              <Col xs={6} className="prevLink">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="#20b6b0"
                  className="bi bi-chevron-left"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                  />
                </svg>{" "}
                &nbsp;
                <a href="#">Install Ballerina</a>
              </Col>
              <Col xs={6} className="nextLink">
                <a href="#">Language basics</a> &nbsp;
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="#20b6b0"
                  className="bi bi-chevron-right"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                  />
                </svg>
              </Col>
            </div>
          </Container>
        </Col>
        <Col sm={2} className="pageToc d-none d-sm-block">
          <h6>On this page</h6>
          <MarkdownNavbar
            source={content}
            ordered={false}
            headingTopOffset={150}
            declarative
          />
        </Col>
      </Layout>
    </>
  );
}
