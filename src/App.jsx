import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeSwitch } from '@/components/theme-switch';

const firstEntry = {
  id: 'phyagent-opc',
  title: 'PhyAgent',
  keywords: ['OPC', 'Physical AI', 'Evidence'],
  abstract: 'A local POC for an industrial Physical AI agent. When digital records are not enough, it asks for field evidence, calls Rover-01, retrieves local knowledge, and only then creates a human-confirmation work order. Factory data and robot actions are simulated for the 2026 息壤杯 OPC competition.',
  cover: '/assets/phyagent-opc-cover.png',
};

const entries = [firstEntry];

const pageTitle = "Hi, I'm τaotao.";

const currentState = 'I major in Mechatronics and Robotics. Lately, I have been exploring SLAM, deep learning, and small experiments with STM32.';

function ArticleToolbar({ checked, onChange }) {
  return (
    <div className="taotao-article-toolbar">
      <Button asChild size="sm">
        <a className="taotao-article-back" href="/">Back to notes</a>
      </Button>
      <ThemeSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

function BlankArticlePage({ checked, onThemeChange }) {
  return (
    <main className="taotao-article-page">
      <ArticleToolbar checked={checked} onChange={onThemeChange} />
      <article className="taotao-article-sheet" aria-label="Blank page" />
    </main>
  );
}

function PhyAgentArticlePage({ checked, onThemeChange }) {
  return (
    <main className="taotao-article-page">
      <ArticleToolbar checked={checked} onChange={onThemeChange} />
      <article className="taotao-article-sheet taotao-article-sheet--full">
        <header className="taotao-article-header">
          <p className="taotao-article-kicker">2026 / 息壤杯 OPC / LOCAL POC</p>
          <h1>PhyAgent</h1>
          <p className="taotao-article-lede">
            When the digital record is not enough, an industrial agent should ask for evidence before it offers an answer.
          </p>
          <div className="taotao-article-status" aria-label="Project status">
            <span>演示模拟</span>
            <span>离线本地 RAG</span>
            <span>人工确认闭环</span>
          </div>
          <p className="taotao-article-note">本地材料已收口；线上提交回执未核验。</p>
        </header>

        <div className="taotao-article-body">
          <section className="taotao-article-section">
            <p className="taotao-article-label">The question</p>
            <h2>不是再做一辆巡检小车</h2>
            <p>
              这次比赛里，我们把问题从“机器人能不能拍到异常”往前推了一步：当生产记录、AOI 结果和维修历史无法解释 SMT 产线的反复异常时，系统能不能自己判断还缺什么证据？
            </p>
            <p>
              PhyAgent 是一个面向智能制造的 Physical AI 决策与编排 POC。人只需要提出调查目标，Agent 负责拆解调查、请求现场证据，并把结果交回给人确认。
            </p>
          </section>

          <section className="taotao-article-section">
            <p className="taotao-article-label">The loop</p>
            <h2>Evidence before answers</h2>
            <ol className="taotao-article-flow">
              <li>
                <strong>01 / Digital records</strong>
                <span>读取 MES、AOI 与维护记录，定位到 SMT-Line-03 的 Mounter-02 / Feeder F12。</span>
              </li>
              <li>
                <strong>02 / Evidence Gate</strong>
                <span>数字证据不足时锁定结论，不允许 Agent 直接猜测根因。</span>
              </li>
              <li>
                <strong>03 / Rover-01</strong>
                <span>确定性能力匹配选择具备地面导航与 RGB 视觉能力的现场工具，获取控制面板和 Feeder F12 近景证据。</span>
              </li>
              <li>
                <strong>04 / Local knowledge</strong>
                <span>通过离线本地 RAG 检索知识库，把证据和可追溯来源放进同一条账本。</span>
              </li>
              <li>
                <strong>05 / Human confirmation</strong>
                <span>证据充分后生成初步根因与维护工单，最终处置仍由人确认。</span>
              </li>
            </ol>
          </section>

          <section className="taotao-article-section">
            <p className="taotao-article-label">Local acceptance</p>
            <h2>一个可以重复播放的闭环</h2>
            <div className="taotao-article-metrics" aria-label="Local mock acceptance results">
              <div>
                <strong>COMPLETED</strong>
                <span>Guided Demo</span>
              </div>
              <div>
                <strong>06</strong>
                <span>evidence records</span>
              </div>
              <div>
                <strong>08</strong>
                <span>tool calls</span>
              </div>
              <div>
                <strong>WO-2026-SMT-0001</strong>
                <span>human-confirmation work order</span>
              </div>
            </div>
            <p className="taotao-article-caption">以上为本地 Mock 验收结果，不代表真实工厂部署或生产实测。</p>
          </section>

          <section className="taotao-article-section">
            <p className="taotao-article-label">The boundary</p>
            <h2>这次真正做到了什么</h2>
            <div className="taotao-article-boundaries">
              <div>
                <h3>已实现</h3>
                <p>可重复的 Mock 状态机、Evidence Gate、能力匹配、Mission Control、离线本地 RAG、证据账本和工单生成。</p>
              </div>
              <div>
                <h3>演示模拟</h3>
                <p>工厂数据、现场画面、Rover-01 移动、传感器结果与 5G 协同均由本地模拟器提供。</p>
              </div>
              <div>
                <h3>待实测</h3>
                <p>真实机器人与 ROS2 接入、真实 5G 链路、厂商设备手册、生产指标和现场安全验证。</p>
              </div>
            </div>
          </section>

          <section className="taotao-article-section taotao-article-section--closing">
            <p className="taotao-article-label">What stays with me</p>
            <p className="taotao-article-closing">
              这次项目最重要的收获，不是让模型说得更像专家，而是给它加了一道“先找证据”的门。Physical AI 的下一步，可能不是让语言模型直接控制更多设备，而是让它更诚实地知道自己还不知道什么。
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}

function FlipCard({ entry }) {
  const [touchFlipped, setTouchFlipped] = useState(false);
  const lastPointerType = useRef(null);

  function handlePointerDown(event) {
    lastPointerType.current = event.pointerType;
  }

  function handlePointerCancel() {
    lastPointerType.current = null;
  }

  function handleClick(event) {
    // Touch has no hover state: reserve the first tap for revealing the abstract.
    // Keyboard and mouse activation retain normal link behaviour.
    if (lastPointerType.current === 'touch' && !touchFlipped) {
      event.preventDefault();
      setTouchFlipped(true);
    }

    lastPointerType.current = null;
  }

  return (
    <article className={`taotao-flip-card${touchFlipped ? ' is-touch-flipped' : ''}`}>
      <a
        className="content"
        href={`/articles/${entry.id}`}
        aria-label={entry.title ? `Open ${entry.title}` : 'Open card'}
        onPointerDown={handlePointerDown}
        onPointerCancel={handlePointerCancel}
        onClick={handleClick}
      >
        <span className="front" aria-hidden="true">
          <span className="front-cover" aria-hidden="true">
            <img className="front-cover-image" src={entry.cover} alt="" />
          </span>
          <span className="front-overlay" aria-hidden="true" />
          <span className="front-content">
            <span className="front-keywords">
              {entry.keywords.join(' / ')}
            </span>
            <span className="front-title">{entry.title}</span>
          </span>
        </span>
        <span className="back" aria-hidden="true">
          <span className="back-content">
            <span className="abstract-label">Abstract</span>
            <span className="abstract-body">{entry.abstract}</span>
          </span>
        </span>
      </a>
    </article>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(() => window.localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#212121' : '#e8e8e8');
    window.localStorage.setItem('theme', theme);
  }, [isDark]);

  let page;

  if (window.location.pathname.startsWith('/articles/')) {
    if (window.location.pathname === `/articles/${firstEntry.id}`) {
      page = <PhyAgentArticlePage checked={isDark} onThemeChange={setIsDark} />;
    } else {
      page = <BlankArticlePage checked={isDark} onThemeChange={setIsDark} />;
    }
  } else {
    page = <main className="taotao-page">
      <div className="taotao-shell">
        <div className="taotao-home-header">
          <h1 aria-label={pageTitle}>
            <svg
              aria-hidden="true"
              className="taotao-title"
              focusable="false"
              viewBox="0 0 600 100"
            >
              <text className="taotao-title__text" x="5" xmlSpace="preserve" y="77">
                {Array.from(pageTitle).map((character, index) => (
                  <tspan
                    className={`taotao-title__character${character === 'τ' ? ' taotao-title__tau' : ''}`}
                    key={`${character}-${index}`}
                    style={{ '--character-delay': `${index * 75}ms` }}
                  >
                    {character}
                  </tspan>
                ))}
              </text>
            </svg>
          </h1>
          <ThemeSwitch checked={isDark} onChange={setIsDark} />
        </div>

        <section className="taotao-current-state" aria-label="Current state">
          <div className="taotao-current-state__copy">
            <p>{currentState}</p>
          </div>
        </section>

        <section className="taotao-card-list" aria-label="Notes">
          {entries.map((entry) => (
            <FlipCard entry={entry} key={entry.id} />
          ))}
        </section>
      </div>
    </main>
  }

  return page;
}
