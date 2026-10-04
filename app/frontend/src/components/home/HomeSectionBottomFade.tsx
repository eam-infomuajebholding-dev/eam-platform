type FadeTarget = 'cream-light' | 'cream' | 'dark';

type Props = {
  /** Background color of the section below — gradient blends into this. */
  to?: FadeTarget;
  /** Match hero card bottom radius when fading out of section 01. */
  rounded?: boolean;
};

/** Soft bottom gradient — same family as hero → About transition. */
export default function HomeSectionBottomFade({ to = 'cream-light', rounded = false }: Props) {
  return (
    <div
      className={`home-section-bottom-fade home-section-bottom-fade--${to}${rounded ? ' home-section-bottom-fade--rounded' : ''}`}
      aria-hidden
    />
  );
}
