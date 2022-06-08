import fs from "fs";
import matter from "gray-matter";

import React from "react";
import ReactMarkdown from "react-markdown";
import ReactDom from "react-dom";

import Layout from "../../../layouts/layout-docs";
import { Container, Col } from "react-bootstrap";

import Head from "next/head";
// import Script from 'next/script';
import Grid from "@mui/material/Grid";

export async function getStaticPaths() {
  // console.log("booooo");
  // Retrieve all our slugs
  const files = fs.readdirSync("swan-lake/by-example");

  const paths = files.map((fileName) => ({
    params: {
      slug: fileName.replace(".html", ""),
    },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const fileName = fs.readFileSync(
    `swan-lake/by-example/${slug}.html`,
    "utf-8"
  );
  const { data: frontmatter, content } = matter(fileName);
  return {
    props: {
      frontmatter,
      content,
    },
  };
}

export default function PostPage({ frontmatter, content }) {
  return (
    <Layout>
      <Col sm={9} xxl={8} className="mdContent">
        <Container>
          {/* <div className="topRow">
            <Col xs={11}>
              <h1>{frontmatter.title}</h1>
            </Col>
            <Col xs={1} className="gitIcon">
              <img src="/images/github.svg" height={20} width={20} />
            </Col>
          </div> */}

          <div dangerouslySetInnerHTML={{ __html: content }} />
        </Container>
      </Col>
    </Layout>
  );
}
