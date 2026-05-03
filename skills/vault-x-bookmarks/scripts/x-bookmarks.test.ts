import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  type BookmarkPost,
  type LinkContentFetcher,
  type XurlJsonRunner,
  buildSourceMarkdown,
  collectSelectedBookmarks,
  hydrateLinkedContent,
  mergePagesWithoutDuplicatePosts,
  parseArgs,
  readCheckpoint,
  readReviewedIds,
  run,
  selectNewestReachableUnreviewed,
  sourceFilename,
  uniquePath,
  // The script is loaded by tsx at runtime; the explicit extension is intentional.
  // @ts-ignore TS5097
} from "./x-bookmarks.ts";

const noLinkedContent: LinkContentFetcher = async (url) => {
  throw new Error(`Unexpected linked content fetch: ${url}`);
};

function post(id: string, createdAt = `2026-01-${id.padStart(2, "0")}T00:00:00Z`): BookmarkPost {
  return {
    id,
    text: `Post ${id}`,
    authorId: "author-1",
    authorName: "Jane Example",
    authorHandle: "jane_example",
    createdAt,
    publicMetrics: {},
    links: [],
  };
}

function tweet(id: string, nextText = `Post ${id}`): Record<string, unknown> {
  return {
    id,
    text: nextText,
    author_id: "author-1",
    created_at: `2026-01-${id.replace(/\D/g, "").padStart(2, "0").slice(-2)}T00:00:00Z`,
    public_metrics: {
      like_count: 1,
      retweet_count: 2,
      reply_count: 3,
      quote_count: 4,
    },
  };
}

function bookmarkResponse(
  ids: string[],
  nextToken: string | null = null
): Record<string, unknown> {
  return {
    data: ids.map((id) => tweet(id)),
    includes: {
      users: [{ id: "author-1", name: "Jane Example", username: "jane_example" }],
    },
    meta: nextToken ? { next_token: nextToken } : {},
  };
}

function fakeBookmarkClient(
  pages: Map<string, Record<string, unknown> | Error>
): { runner: XurlJsonRunner; requestedTokens: Array<string | null>; requestedArgs: string[][] } {
  const requestedTokens: Array<string | null> = [];
  const requestedArgs: string[][] = [];
  const runner: XurlJsonRunner = async (args) => {
    requestedArgs.push(args);
    assert.deepEqual(args.slice(0, 2), ["--auth", "oauth2"]);
    const requestPath = args.at(-1) ?? "";
    assert.match(requestPath, /^\/2\/users\/user-1\/bookmarks\?/);
    const query = new URLSearchParams(requestPath.split("?")[1] ?? "");
    const token = query.get("pagination_token");
    requestedTokens.push(token);
    const page = pages.get(token ?? "");
    if (page instanceof Error) {
      throw page;
    }
    if (!page) {
      throw new Error(`Unexpected bookmark request token: ${token ?? "head"}`);
    }
    return page;
  };

  return { runner, requestedTokens, requestedArgs };
}

async function withTempDir<T>(callback: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(path.join(tmpdir(), "x-bookmarks-test-"));
  try {
    return await callback(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("parseArgs returns defaults and validates flags", () => {
  assert.deepEqual(parseArgs([]), {
    limit: 15,
    maxPages: 10,
    headPages: 2,
    vaultRoot: process.cwd(),
  });

  assert.deepEqual(parseArgs(["--limit", "7", "--max-pages", "8", "--head-pages", "3"]), {
    limit: 7,
    maxPages: 8,
    headPages: 3,
    vaultRoot: process.cwd(),
  });

  assert.equal(parseArgs(["--path", "relative-vault"]).vaultRoot, path.resolve("relative-vault"));
  assert.throws(() => parseArgs(["--limit", "0"]), /--limit must be an integer from 1 to 100/);
  assert.throws(() => parseArgs(["--max-pages", "101"]), /--max-pages must be an integer from 1 to 100/);
  assert.throws(() => parseArgs(["--head-pages"]), /--head-pages requires a value/);
  assert.throws(() => parseArgs(["--user-id", "123"]), /Unknown argument: --user-id/);
});

test("selectNewestReachableUnreviewed chooses newest reachable unreviewed posts first", () => {
  const selected = selectNewestReachableUnreviewed(
    [
      [post("5"), post("4")],
      [post("3"), post("2")],
      [post("1")],
    ],
    new Set(["3"]),
    3
  );

  assert.deepEqual(
    selected.map((item) => item.id),
    ["5", "4", "2"]
  );
});

test("mergePagesWithoutDuplicatePosts keeps the first occurrence", () => {
  const merged = mergePagesWithoutDuplicatePosts([
    [
      [post("a"), post("b")],
      [post("c"), post("a")],
    ],
    [[post("b"), post("d")]],
  ]);

  assert.deepEqual(
    merged.map((page) => page.map((item) => item.id)),
    [["a", "b"], ["c"], ["d"]]
  );
});

test("buildSourceMarkdown creates an external source record", () => {
  const markdown = buildSourceMarkdown(
    {
      ...post("123", "2026-02-03T04:05:06Z"),
      text: "Useful bookmark about durable notes",
      authorName: "Jane Doe",
      authorHandle: "@jane_doe",
      links: ["https://example.com/article"],
    },
    "2026-02-04T00:00:00Z"
  );

  assert.match(markdown, /tags:\n  - external/);
  assert.match(markdown, /source: x-bookmark/);
  assert.match(markdown, /source_url: https:\/\/x\.com\/jane_doe\/status\/123/);
  assert.match(markdown, /posted_at: "2026-02-03T04:05:06Z"/);
  assert.doesNotMatch(markdown, /vault_candidate_reason/);
  assert.match(markdown, /## Metadata/);
});

test("buildSourceMarkdown includes X article title, text, and links", () => {
  const markdown = buildSourceMarkdown(
    {
      ...post("2027435582461259997", "2026-02-27T17:28:05.000Z"),
      text: "https://t.co/MpSGVYBF2x",
      authorName: "Noah Vincent",
      authorHandle: "noahvnct",
      links: ["http://x.com/i/article/2027430849495367680", "https://youtu.be/demo"],
      article: {
        title: "How to Build Your AI Second Brain Using Obsidian + Claude Code",
        previewText: "Introduction: Why I've Been Losing Sleep Over This",
        text: "Two weeks ago, I connected Claude Code to my Obsidian vault.",
        links: ["https://youtu.be/demo"],
      },
    },
    "2026-05-02T23:12:35.712Z"
  );

  assert.match(
    markdown,
    /# X Bookmark: How to Build Your AI Second Brain Using Obsidian \+ Claude Code/
  );
  assert.match(markdown, /## Article/);
  assert.match(markdown, /Title: How to Build Your AI Second Brain/);
  assert.match(markdown, /Two weeks ago, I connected Claude Code/);
  assert.match(markdown, /### Article Links/);
  assert.match(markdown, /https:\/\/youtu\.be\/demo/);
});

test("buildSourceMarkdown includes fetched linked content", () => {
  const markdown = buildSourceMarkdown(
    {
      ...post("321", "2026-02-03T04:05:06Z"),
      text: "Useful external article https://example.com/deep-dive",
      links: ["https://example.com/deep-dive"],
      linkedContent: [
        {
          url: "https://example.com/deep-dive",
          finalUrl: "https://www.example.com/deep-dive",
          title: "Durable Notes Deep Dive",
          text: "This is the extracted external article body.",
          contentType: "text/html",
        },
      ],
    },
    "2026-02-04T00:00:00Z"
  );

  assert.match(markdown, /## Linked Content/);
  assert.match(markdown, /### Durable Notes Deep Dive/);
  assert.match(markdown, /URL: https:\/\/example\.com\/deep-dive/);
  assert.match(markdown, /Final URL: https:\/\/www\.example\.com\/deep-dive/);
  assert.match(markdown, /This is the extracted external article body/);
});

test("hydrateLinkedContent fetches direct external links and skips X or media links", async () => {
  const requestedUrls: string[] = [];
  const errors: string[] = [];
  const hydrated = await hydrateLinkedContent(
    {
      ...post("456"),
      links: [
        "https://example.com/article",
        "https://x.com/someone/status/123",
        "https://pbs.twimg.com/media/example.jpg",
        "https://example.com/article",
        "https://example.com/demo.mp4",
      ],
    },
    async (url) => {
      requestedUrls.push(url);
      return {
        url,
        title: "Fetched Article",
        text: "Fetched article text",
        contentType: "text/html",
      };
    },
    errors
  );

  assert.deepEqual(requestedUrls, ["https://example.com/article"]);
  assert.deepEqual(errors, []);
  assert.deepEqual(hydrated.linkedContent?.map((content) => content.url), [
    "https://example.com/article",
  ]);
});

test("hydrateLinkedContent does not fetch links that only came from an X article body", async () => {
  const requestedUrls: string[] = [];
  const errors: string[] = [];
  const hydrated = await hydrateLinkedContent(
    {
      ...post("789"),
      links: ["https://example.com/inside-article"],
      article: {
        title: "X Article",
        text: "The article body already includes this external link.",
        links: ["https://example.com/inside-article"],
      },
    },
    async (url) => {
      requestedUrls.push(url);
      return {
        url,
        title: "Should Not Fetch",
        text: "This should not be captured.",
      };
    },
    errors
  );

  assert.deepEqual(requestedUrls, []);
  assert.deepEqual(errors, []);
  assert.equal(hydrated.linkedContent, undefined);
});

test("sourceFilename names files after article title when present", () => {
  assert.equal(
    sourceFilename(
      {
        ...post("123", "2026-02-03T04:05:06Z"),
        authorHandle: "@Jane Doe",
        article: {
          title: "How to Build Your AI Second Brain Using Obsidian + Claude Code",
          text: "Article body",
          links: [],
        },
      },
      "2026-02-04T00:00:00Z"
    ),
    "2026-02-03-x-bookmark-how-to-build-your-ai-second-brain-using-obsidian-claude-code.md"
  );
});

test("sourceFilename falls back to linked content title and post text", () => {
  assert.equal(
    sourceFilename(
      {
        ...post("456", "2026-02-03T04:05:06Z"),
        text: "Useful external article https://example.com/deep-dive",
        linkedContent: [
          {
            url: "https://example.com/deep-dive",
            title: "Durable Notes Deep Dive",
            text: "Article body",
          },
        ],
      },
      "2026-02-04T00:00:00Z"
    ),
    "2026-02-03-x-bookmark-durable-notes-deep-dive.md"
  );

  assert.equal(
    sourceFilename(
      {
        ...post("789", "2026-02-03T04:05:06Z"),
        text: "These 6 principles will make your coding agent write better code.",
      },
      "2026-02-04T00:00:00Z"
    ),
    "2026-02-03-x-bookmark-these-6-principles-will-make-your-coding-agent-write-better-code.md"
  );
});

test("readReviewedIds tolerates missing files and parses JSONL", async () => {
  await withTempDir(async (dir) => {
    const reviewedPath = path.join(dir, "reviewed.jsonl");

    assert.deepEqual(await readReviewedIds(reviewedPath), new Set());

    await writeFile(
      reviewedPath,
      [
        JSON.stringify({ post_id: "one" }),
        "",
        JSON.stringify({ post_id: "two", ignored: true }),
        JSON.stringify({ post_id: 3 }),
      ].join("\n"),
      "utf8"
    );

    assert.deepEqual(await readReviewedIds(reviewedPath), new Set(["one", "two"]));
  });
});

test("readCheckpoint tolerates missing checkpoint files", async () => {
  await withTempDir(async (dir) => {
    const checkpointPath = path.join(dir, "checkpoint.json");

    assert.deepEqual(await readCheckpoint(checkpointPath), {});

    await writeFile(checkpointPath, JSON.stringify({ backlog_token: "next" }), "utf8");
    assert.deepEqual(await readCheckpoint(checkpointPath), { backlog_token: "next" });
  });
});

test("uniquePath avoids overwriting existing files", async () => {
  await withTempDir(async (dir) => {
    const filePath = path.join(dir, "source.md");
    await writeFile(filePath, "first", "utf8");
    await writeFile(path.join(dir, "source-2.md"), "second", "utf8");

    assert.equal(await uniquePath(filePath), path.join(dir, "source-3.md"));
  });
});

test("collectSelectedBookmarks scans head then backlog and preserves a mid-page backlog cursor", async () => {
  const pages = new Map<string, Record<string, unknown> | Error>([
    ["", bookmarkResponse(["h2", "h1"], "head-next")],
    ["head-next", bookmarkResponse(["b2", "b1"], "older")],
  ]);
  const { runner, requestedTokens, requestedArgs } = fakeBookmarkClient(pages);

  const result = await collectSelectedBookmarks(
    runner,
    "user-1",
    { limit: 3, maxPages: 3, headPages: 1, vaultRoot: process.cwd() },
    {},
    new Set()
  );

  assert.deepEqual(
    result.selected.map((item) => item.id),
    ["h2", "h1", "b2"]
  );
  assert.equal(result.pagesFetched, 2);
  assert.equal(result.nextBacklogToken, "head-next");
  assert.equal(result.backlogExhausted, false);
  assert.deepEqual(requestedTokens, [null, "head-next"]);
  assert.deepEqual(requestedArgs[0].slice(0, 2), ["--auth", "oauth2"]);
});

test("collectSelectedBookmarks resets a stale saved backlog cursor", async () => {
  const pages = new Map<string, Record<string, unknown> | Error>([
    ["", bookmarkResponse(["h1"], "head-next")],
    ["stale", new Error("Invalid pagination token")],
    ["head-next", bookmarkResponse(["b1"])],
  ]);
  const { runner, requestedTokens } = fakeBookmarkClient(pages);

  const result = await collectSelectedBookmarks(
    runner,
    "user-1",
    { limit: 1, maxPages: 3, headPages: 1, vaultRoot: process.cwd() },
    { backlog_token: "stale" },
    new Set(["h1"])
  );

  assert.deepEqual(
    result.selected.map((item) => item.id),
    ["b1"]
  );
  assert.equal(result.cursorReset, true);
  assert.match(result.errors.join("\n"), /Saved backlog cursor was rejected/);
  assert.deepEqual(requestedTokens, [null, "stale", "head-next"]);
});

test("collectSelectedBookmarks does not select duplicate head-page posts twice", async () => {
  const pages = new Map<string, Record<string, unknown> | Error>([
    ["", bookmarkResponse(["h2", "h1", "h1"])],
  ]);
  const { runner, requestedTokens } = fakeBookmarkClient(pages);

  const result = await collectSelectedBookmarks(
    runner,
    "user-1",
    { limit: 3, maxPages: 1, headPages: 1, vaultRoot: process.cwd() },
    {},
    new Set()
  );

  assert.deepEqual(
    result.selected.map((item) => item.id),
    ["h2", "h1"]
  );
  assert.deepEqual(requestedTokens, [null]);
});

test("run appends JSONL records with a separator when the file lacks a trailing newline", async () => {
  await withTempDir(async (vaultRoot) => {
    const reviewedPath = path.join(vaultRoot, "raw", "state", "x-bookmarks", "reviewed.jsonl");
    await mkdir(path.dirname(reviewedPath), { recursive: true });
    await writeFile(
      reviewedPath,
      JSON.stringify({
        post_id: "already-reviewed",
        reviewed_at: "2026-01-01T00:00:00Z",
        run_id: "previous",
        decision: "captured",
        source_record_path: "raw/sources/old.md",
        source: "main",
      }),
      "utf8"
    );

    const originalConsoleLog = console.log;
    console.log = () => undefined;
    const runner: XurlJsonRunner = async (args) => {
      if (args[0] === "whoami") {
        return { id: "user-1" };
      }
      const requestPath = args.at(-1) ?? "";
      if (requestPath.includes("/bookmarks")) {
        return bookmarkResponse(["fresh"]);
      }
      throw new Error(`Unexpected live-style request path: ${requestPath}`);
    };

    try {
      await run({ limit: 1, maxPages: 1, headPages: 1, vaultRoot }, runner, noLinkedContent);
    } finally {
      console.log = originalConsoleLog;
    }

    const reviewedContent = await readFile(reviewedPath, "utf8");
    assert.match(reviewedContent, /}\n\{/);
    assert.equal(reviewedContent.endsWith("\n"), true);
    assert.deepEqual(
      reviewedContent
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line).post_id),
      ["already-reviewed", "fresh"]
    );

    const sourceFiles = await readdir(path.join(vaultRoot, "raw", "sources"));
    assert.equal(sourceFiles.length, 1);
    const sourceContent = await readFile(
      path.join(vaultRoot, "raw", "sources", sourceFiles[0]),
      "utf8"
    );
    assert.match(sourceContent, /post_id: "fresh"/);
  });
});

test("run captures full note_tweet text when X truncates long posts", async () => {
  await withTempDir(async (vaultRoot) => {
    const fullText =
      "These 6 principles will make your coding agent write better code.\n\nVerify, don't assume — Run it. Test it. Prove it works.";
    const originalConsoleLog = console.log;
    console.log = () => undefined;
    const runner: XurlJsonRunner = async (args) => {
      if (args[0] === "whoami") {
        return { id: "user-1" };
      }
      const requestPath = args.at(-1) ?? "";
      if (requestPath.includes("/bookmarks")) {
        assert.match(requestPath, /tweet\.fields=.*note_tweet/);
        return {
          ...bookmarkResponse(["long-post"]),
          data: [
            {
              ...tweet("long-post", "These 6 principles will make your coding agent write better code."),
              note_tweet: {
                text: fullText,
                entities: {
                  urls: [
                    {
                      url: "https://t.co/example",
                      expanded_url: "https://agents.md/",
                    },
                  ],
                },
              },
            },
          ],
        };
      }
      throw new Error(`Unexpected live-style request path: ${requestPath}`);
    };

    try {
      await run(
        { limit: 1, maxPages: 1, headPages: 1, vaultRoot },
        runner,
        async (url) => ({
          url,
          title: "Linked note source",
          text: "Linked note source text",
        })
      );
    } finally {
      console.log = originalConsoleLog;
    }

    const sourceFiles = await readdir(path.join(vaultRoot, "raw", "sources"));
    assert.equal(sourceFiles.length, 1);
    const sourceContent = await readFile(
      path.join(vaultRoot, "raw", "sources", sourceFiles[0]),
      "utf8"
    );
    assert.match(sourceContent, /Verify, don't assume/);
    assert.match(sourceContent, /https:\/\/agents\.md\//);
  });
});

test("run captures X article payload text from article bookmarks", async () => {
  await withTempDir(async (vaultRoot) => {
    const originalConsoleLog = console.log;
    console.log = () => undefined;
    const runner: XurlJsonRunner = async (args) => {
      if (args[0] === "whoami") {
        return { id: "user-1" };
      }
      const requestPath = args.at(-1) ?? "";
      if (requestPath.includes("/bookmarks")) {
        assert.match(requestPath, /tweet\.fields=.*article/);
        assert.match(requestPath, /expansions=.*article\.cover_media/);
        assert.match(requestPath, /expansions=.*article\.media_entities/);
        return {
          ...bookmarkResponse(["article-post"]),
          data: [
            {
              ...tweet("article-post", "https://t.co/MpSGVYBF2x"),
              article: {
                title: "How to Build Your AI Second Brain Using Obsidian + Claude Code",
                preview_text: "Introduction: Why I've Been Losing Sleep Over This",
                plain_text:
                  "Introduction: Why I've Been Losing Sleep Over This\n\nTwo weeks ago, I connected Claude Code to my Obsidian vault.",
                entities: {
                  urls: [
                    { text: "https://www.youtube.com/watch?v=BLdO-32I6Yc" },
                    { text: "Claude.ai" },
                  ],
                },
              },
              entities: {
                urls: [
                  {
                    url: "https://t.co/MpSGVYBF2x",
                    expanded_url: "http://x.com/i/article/2027430849495367680",
                  },
                ],
              },
            },
          ],
        };
      }
      throw new Error(`Unexpected live-style request path: ${requestPath}`);
    };

    try {
      await run(
        { limit: 1, maxPages: 1, headPages: 1, vaultRoot },
        runner,
        async (url) => ({
          url,
          title: "Linked article source",
          text: "Linked article source text",
        })
      );
    } finally {
      console.log = originalConsoleLog;
    }

    const sourceFiles = await readdir(path.join(vaultRoot, "raw", "sources"));
    assert.equal(sourceFiles.length, 1);
    const sourceContent = await readFile(
      path.join(vaultRoot, "raw", "sources", sourceFiles[0]),
      "utf8"
    );
    assert.match(sourceContent, /# X Bookmark: How to Build Your AI Second Brain/);
    assert.match(sourceContent, /## Article/);
    assert.match(sourceContent, /Two weeks ago, I connected Claude Code/);
    assert.match(sourceContent, /https:\/\/www\.youtube\.com\/watch\?v=BLdO-32I6Yc/);
    assert.match(sourceContent, /http:\/\/x\.com\/i\/article\/2027430849495367680/);
  });
});

test("run captures fetched direct external link content without recursive link crawling", async () => {
  await withTempDir(async (vaultRoot) => {
    const requestedUrls: string[] = [];
    const originalConsoleLog = console.log;
    console.log = () => undefined;
    const runner: XurlJsonRunner = async (args) => {
      if (args[0] === "whoami") {
        return { id: "user-1" };
      }
      const requestPath = args.at(-1) ?? "";
      if (requestPath.includes("/bookmarks")) {
        return {
          ...bookmarkResponse(["external-link"]),
          data: [
            {
              ...tweet("external-link", "Good breakdown https://t.co/example"),
              entities: {
                urls: [
                  {
                    url: "https://t.co/example",
                    expanded_url: "https://example.com/article",
                  },
                ],
              },
            },
          ],
        };
      }
      throw new Error(`Unexpected live-style request path: ${requestPath}`);
    };
    const linkFetcher: LinkContentFetcher = async (url) => {
      requestedUrls.push(url);
      return {
        url,
        title: "External Article",
        text: "Fetched body with a nested link https://nested.example.com/ignored",
        contentType: "text/html",
      };
    };

    try {
      await run({ limit: 1, maxPages: 1, headPages: 1, vaultRoot }, runner, linkFetcher);
    } finally {
      console.log = originalConsoleLog;
    }

    assert.deepEqual(requestedUrls, ["https://example.com/article"]);

    const sourceFiles = await readdir(path.join(vaultRoot, "raw", "sources"));
    assert.equal(sourceFiles.length, 1);
    const sourceContent = await readFile(
      path.join(vaultRoot, "raw", "sources", sourceFiles[0]),
      "utf8"
    );
    assert.match(sourceContent, /## Linked Content/);
    assert.match(sourceContent, /### External Article/);
    assert.match(sourceContent, /Fetched body with a nested link/);
  });
});

test("run removes a source record when reviewed append fails", async () => {
  await withTempDir(async (vaultRoot) => {
    const stateDir = path.join(vaultRoot, "raw", "state", "x-bookmarks");
    const reviewedPath = path.join(stateDir, "reviewed.jsonl");
    const checkpointPath = path.join(stateDir, "checkpoint.json");
    const sourcesDir = path.join(vaultRoot, "raw", "sources");
    await mkdir(stateDir, { recursive: true });
    await writeFile(reviewedPath, "", "utf8");

    const originalConsoleLog = console.log;
    console.log = () => undefined;
    const runner: XurlJsonRunner = async (args) => {
      if (args[0] === "whoami") {
        return { id: "user-1" };
      }
      const requestPath = args.at(-1) ?? "";
      if (requestPath.includes("/bookmarks")) {
        await rm(reviewedPath, { force: true });
        await mkdir(reviewedPath);
        return bookmarkResponse(["cleanup"]);
      }
      throw new Error(`Unexpected live-style request path: ${requestPath}`);
    };

    try {
      await assert.rejects(
        run({ limit: 1, maxPages: 1, headPages: 1, vaultRoot }, runner),
        /Run completed with source\/state write errors; checkpoint was not advanced\./
      );
    } finally {
      console.log = originalConsoleLog;
    }

    assert.deepEqual(await readdir(sourcesDir), []);
    await assert.rejects(readFile(checkpointPath, "utf8"), (error: unknown) => {
      return error instanceof Error && "code" in error && error.code === "ENOENT";
    });
  });
});
