/** 「被挂上小蓝书」结局的帖子渲染 */
export function XhsPost({ version }: { version: 'male' | 'female' }) {
  const who = version === 'male' ? '这个男的' : '这个女的'
  return (
    <div className="xhs-post fade-in">
      <div className="xhs-head">
        <div className="xhs-avatar">🍋</div>
        <div>
          <div className="xhs-name">朝阳区纪委编外成员</div>
          <div style={{ fontSize: 11, color: '#999' }}>2小时前 · 北京</div>
        </div>
        <div className="xhs-follow">关注</div>
      </div>
      <div className="xhs-title">🚨避雷!北京Dating奇葩实录,姐妹们快来对暗号</div>
      <div className="xhs-body">
        本来不想发的,但{who}
        的操作实在太下头了,必须挂出来给大家避雷。事情是这样的……(下滑查看9张证据图)
        家人们谁懂啊,我全程脚趾抠地,已老实,求放过。
      </div>
      <div className="xhs-tags">#北京dating #避雷 #下头 #对暗号 #亮马河</div>
      <div className="xhs-meta">
        <span>❤️ 2.1w</span>
        <span>⭐ 8964</span>
        <span>💬 3427</span>
      </div>
      <div className="xhs-comment">
        <b>热评</b>不是吧,这不会是我认识的那个人吧,对了一下时间线,汗流浃背了
      </div>
      <div className="xhs-comment">
        <b>热评</b>北京就一个亮马河,大家迟早都会在这里相遇 🦆
      </div>
      <div className="xhs-comment">
        <b>热评</b>楼主宝宝别难过,TA只是把你当成了并行任务里的一个线程
      </div>
    </div>
  )
}
