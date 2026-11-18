export function createBrandDanmaku({ createElement, useState }) {
  return function BrandDanmaku({ rows }) {
    const [paused, setPaused] = useState(false)
    const toggleLabel = paused ? '播放弹幕' : '暂停弹幕'

    return createElement(
      'section',
      {
        className: 'brand-danmaku',
        'aria-label': '中秋礼盒弹幕',
        'data-paused': paused,
      },
      createElement(
        'div',
        { className: 'brand-danmaku__viewport' },
        rows.map((messages, index) =>
          createElement(
            'div',
            { className: 'brand-danmaku__track', key: index },
            [false, true].map((duplicate) =>
              createElement(
                'ul',
                {
                  className: 'brand-danmaku__group',
                  role: 'list',
                  'aria-hidden': duplicate || undefined,
                  key: String(duplicate),
                },
                messages.map((message, messageIndex) =>
                  createElement(
                    'li',
                    { className: 'brand-danmaku__message', key: messageIndex },
                    message,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
      createElement(
        'button',
        {
          className: 'brand-danmaku__toggle',
          type: 'button',
          title: toggleLabel,
          'aria-label': toggleLabel,
          onClick: () => setPaused((previous) => !previous),
        },
        createElement('span', { 'aria-hidden': true }),
      ),
    )
  }
}
