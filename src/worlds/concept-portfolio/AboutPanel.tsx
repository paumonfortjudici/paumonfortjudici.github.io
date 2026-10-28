// "About Ona": the client panel. A folder-tab drawer on the right (a bottom sheet on phones) with her bio, three invented projects,
// her availability, an invented brief, the deck's palette as click-to-copy chips and its fonts, with a live sample of Anybody whose
// width axis you can slide. Everything about Ona is fictional and says so.
import { useEffect, useRef, useState } from 'react'
import { Folder, Stamp, TabButton } from '@/components/primitives'
import { toast } from '@/components/chrome/toast'
import { copyToClipboard } from '@/lib/hooks'
import { COPY } from './copy'
import { CLIENT, FONTS, PALETTE, SAMPLE, type Swatch } from './data'
import { useInert } from './deck'
import { StretchWord } from './StretchWord'
import { useModal } from './useModal'

interface AboutPanelProps {
  open: boolean
  onClose: () => void
}

export function AboutPanel({ open, onClose }: AboutPanelProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const modal = useModal(open, onClose, () => closeRef.current)
  const shell = useRef<HTMLDivElement>(null)
  useInert(shell, !open)

  const [width, setWidth] = useState(100)
  const [mix, setMix] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const timer = useRef<number>(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copySwatch = async (swatch: Swatch) => {
    const ok = await copyToClipboard(swatch.hex)
    if (!ok) return
    setCopied(swatch.hex)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(null), 1800)
    try {
      toast(COPY.panel.copiedToast(swatch.hex), { swatch: swatch.hex, label: swatch.name })
    } catch {
      /* the chip itself says Copied */
    }
  }

  return (
    <div ref={shell} className="w-cp-over" data-kind="about" data-open={open ? 'true' : 'false'} aria-hidden={open ? undefined : true}>
      <button type="button" className="w-cp-over-scrim" tabIndex={-1} aria-hidden="true" onClick={onClose} />
      <div ref={modal.ref} className="w-cp-drawer" role="dialog" aria-modal="true" aria-labelledby="w-cp-about-title" tabIndex={-1} onKeyDown={modal.onKeyDown}>
        <Folder tab={COPY.panel.tab} tabX={0.06} color="var(--cp-paper)" ink="var(--cp-ink)" rim={false} className="w-cp-folder" bodyClassName="w-cp-folder-body">
          <div className="w-cp-drawer-scroll" data-cursor="native">
            <header className="w-cp-about-head">
              <h3 id="w-cp-about-title" className="w-cp-about-name">
                <StretchWord text="ONA RIBAS" widths={[140, 78, 140, 100, 112, 56, 150, 72, 140]} />
              </h3>
              <TabButton
                ref={closeRef}
                className="w-cp-about-close"
                size="sm"
                color="var(--cp-ink)"
                ink="var(--cp-butter)"
                icon="cross"
                iconPosition="before"
                cursor="Close"
                onClick={onClose}
              >
                {COPY.panel.close}
              </TabButton>
              <div className="w-cp-about-meta">
                <p className="w-cp-about-line t-label">
                  {CLIENT.profession}
                  <span className="w-cp-dot" aria-hidden="true">
                    {' · '}
                  </span>
                  {CLIENT.city}
                </p>
                <div className="w-cp-about-stamp">
                  <Stamp text={COPY.panel.invented} tone="oxblood" rotate={-5} size="1.05rem" rough={2} />
                </div>
              </div>
            </header>

            <p className="w-cp-bio">{CLIENT.bio}</p>

            <p className="w-cp-avail" role="note">
              <span className="w-cp-avail-tag t-label">{CLIENT.availability}</span>
              <span className="w-cp-avail-note">{CLIENT.availabilityNote}</span>
            </p>

            <section className="w-cp-block" aria-labelledby="w-cp-projects">
              <h4 id="w-cp-projects" className="w-cp-h t-label">
                {COPY.panel.projectsTitle}
              </h4>
              <ul className="w-cp-ledger">
                {CLIENT.projects.map((project) => (
                  <li key={project.title}>
                    <span className="w-cp-ledger-year">{project.year}</span>
                    <span className="w-cp-ledger-title">{project.title}</span>
                    <span className="w-cp-ledger-kind t-label">
                      {project.kind}
                      <span aria-hidden="true">{' · '}</span>
                      {project.how}
                    </span>
                    <span className="w-cp-ledger-line">{project.line}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="w-cp-block w-cp-brief" aria-labelledby="w-cp-brief-h">
              <h4 id="w-cp-brief-h" className="w-cp-h t-label">
                {COPY.panel.briefTitle}
                <span className="w-cp-tag">{COPY.panel.briefTag}</span>
              </h4>
              <p>{COPY.panel.brief}</p>
            </section>

            <section className="w-cp-block" aria-labelledby="w-cp-palette-h">
              <h4 id="w-cp-palette-h" className="w-cp-h t-label">
                {COPY.panel.paletteTitle}
              </h4>
              <p className="w-cp-note-small">{COPY.panel.paletteHint}</p>
              <ul className="w-cp-swatches">
                {PALETTE.map((swatch) => (
                  <li key={swatch.hex}>
                    <button type="button" className="w-cp-swatch" data-cursor="Copy" aria-label={`Copy ${swatch.name}, ${swatch.hex}`} onClick={() => void copySwatch(swatch)}>
                      <span className="w-cp-chip" style={{ background: `var(--cp-${swatch.v})` }} aria-hidden="true" />
                      <span className="w-cp-sw-name">{swatch.name}</span>
                      <span className="w-cp-sw-hex">{copied === swatch.hex ? COPY.panel.copied : swatch.hex}</span>
                      <span className="w-cp-sw-role">{swatch.role}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="w-cp-block" aria-labelledby="w-cp-fonts-h">
              <h4 id="w-cp-fonts-h" className="w-cp-h t-label">
                {COPY.panel.fontsTitle}
              </h4>
              <div className="w-cp-sample" role="group" aria-label={COPY.panel.sampleLabel}>
                <p className="w-cp-sample-word">
                  <StretchWord text={SAMPLE.word} widths={SAMPLE.widths} base={100} offset={width - 100} mix={mix ? 1 : 0} />
                </p>
                <div className="w-cp-sample-ctl">
                  <label className="w-cp-range">
                    <span className="w-cp-range-l t-label">
                      {COPY.panel.widthLabel}
                      <output className="w-cp-range-v" aria-live="off">
                        {width}
                      </output>
                    </span>
                    <input type="range" min={50} max={150} step={1} value={width} onChange={(e) => setWidth(Number(e.currentTarget.value))} />
                  </label>
                  <button type="button" className="w-cp-mix t-label" aria-pressed={mix} onClick={() => setMix((m) => !m)}>
                    <span className="w-cp-mix-dot" aria-hidden="true" />
                    {COPY.panel.mixLabel}
                    <span className="w-cp-mix-state">{mix ? COPY.panel.mixOn : COPY.panel.mixOff}</span>
                  </button>
                </div>
                <p className="w-cp-note-small">{COPY.panel.mixHelp}</p>
              </div>
              <ul className="w-cp-fonts">
                {FONTS.map((font) => (
                  <li key={font.name}>
                    <span className="w-cp-font-name" data-live={font.loaded ? 'true' : undefined}>
                      {font.name}
                    </span>
                    <span className="w-cp-font-role t-label">{font.role}</span>
                    <span className="w-cp-font-detail">{font.detail}</span>
                  </li>
                ))}
              </ul>
              <p className="w-cp-note-small">
                {COPY.panel.fontsNote} {COPY.panel.licence}.
              </p>
            </section>

            <p className="w-cp-invented">{COPY.panel.inventedLine}</p>
          </div>
        </Folder>
      </div>
    </div>
  )
}
