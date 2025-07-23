let selectedIndex = -1;

$('#suggestBox').removeClass('suggestBoxCss').empty();

function searchSuggest() {
  $('#keywordInput').on('input', function () {
    const query = $(this).val().trim();
	
	
    if (query.length === 0) {
//      $('#suggestBox').empty();
		$('#suggestBox').removeClass('suggestBoxCss').empty();
      $('#overlay').hide();
      return;
    }
	$('#keywordInput').on('focus click', function () {
	  const query = $(this).val().trim();

	  // 🔁 입력값이 있고 추천이 꺼져 있을 때만 다시 실행
	  if (query.length > 0 && !$('#overlay').is(':visible')) {
	    $(this).trigger('input');
	  }
	});


    $('#overlay').show();

    $.ajax({
      url: '/support/search-all',
      method: 'GET',
      data: { keyword: query },
      success: function (data) {
        const box = $('#suggestBox');
        box.empty();
		box.addClass('suggestBoxCss');

        const notices = data.notices || [];
        const faqs = data.faqs || [];

        if (notices.length === 0 && faqs.length === 0) {
          box.append('<div style="padding-top:30px; padding-bottom:30px; color: #898989; text-align : center; font-size:36px;">관련 키워드가 없습니다.</div>');
          box.append(`
            <div class="suggestBottom">
              <div style="display: flex;" onclick="location.href='/support/feedback/send'" class="suggestBottomIn">
                <div style="flex: 1;"><img src="/images/symbol_feedback.png" style="width:40px; height:40px;" /></div>
                <div style="flex: 4; text-align: center;">피드백 작성하기</div>
                <div style="flex: 1;"></div>
              </div>
            </div>
          `);
          return;
        }

        // 🔔 공지사항 표시
        notices.forEach(notice => {
          const item = createSuggestItem({
            title: notice.notice_title,
            label: '공지사항',
            icon: '/images/symbol_notice.png',
            link: `/support/notice/${notice.notice_id}`,
            hits: notice.notice_hits
          });
          box.append(item);
        });

        // ❓ FAQ 표시
        faqs.forEach(faq => {
          const item = createSuggestItem({
            title: faq.faq_title,
            label: 'FAQ',
            icon: '/images/symbol_faq.png',
//          link: `/support/faq/${faq.faq_id}`,
			link: `/support/faq?openId=${faq.faq_id}`,

            hits: faq.faq_hits
          });
          box.append(item);
        });

        box.append(`
          <div class="suggestBottom">
            <div style="display: flex;" onclick="location.href='/support/feedback/send'" class="suggestBottomIn">
              <div style="flex: 1;"><img src="/images/symbol_feedback.png" style="width:40px; height:40px;" /></div>
              <div style="flex: 4; text-align: center; cursor: pointer">피드백 작성하기</div>
              <div style="flex: 1;"></div>
            </div>
          </div>
        `);

        highlightKeywordInCells(query);
      },
      error: function () {
        $('#suggestBox').html('<div style="padding:10px;">요청 실패</div>');
      }
    });
  });
}

// 🔧 공지/FAQ 공통 아이템 생성 함수
function createSuggestItem({ title, label, icon, link, hits }) {
  const item = $('<div class="suggestItem"></div>')
    .css({
      padding: '10px',
      cursor: 'pointer',
      borderBottom: '1px solid #eee',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      transition: 'background-color 0.3s, color 0.3s'
    })
    .on('click', function () {
      $('#keywordInput').val(title);
      location.href = link;
      $('#suggestBox').empty();
    })
    .hover(
      function () {
        $(this).css({
          backgroundColor: 'rgba(87,1,208, 0.2)',
          color: 'rgb(87,1,208)'
        });
      },
      function () {
        $(this).css({
          backgroundColor: '',
          color: ''
        });
      }
    );

  // 아이콘
  const imgDiv = $('<div></div>').css({
    flex: '0 0 40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
	paddingLeft: '18px'
  });
  const img = $('<img>')
    .attr('src', icon)
    .css({
      width: '36px',
      height: '36px',
      objectFit: 'contain'
    });
  imgDiv.append(img);

  // 라벨 (공지사항 / FAQ)
  const labelDiv = $('<div></div>')
    .text(label)
    .css({
      flex: '0 0 64px',
      color: '#5701d0',
      fontWeight: 'bold',
//    fontSize: '16px',
	  fontSize: label === 'FAQ' ? '22px' : '16px',
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'color 0.3s'
    });

  // 제목
  const titleDiv = $('<div></div>')
    .addClass('suggest-title')
    .text(title)
    .css({
      flex: '1',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
	  paddingLeft: '40px'
    });

  // 조회수 라벨
  const hitsLabelDiv = $('<div></div>')
    .text('조회수')
    .css({
      flex: '0 0 60px',
      fontSize: '15px',
      color: '#aaa',
      textAlign: 'right',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end'
    });

  // 조회수 값
  const hitsValueDiv = $('<div></div>')
    .text(hits)
    .css({
      flex: '0 0 40px',
      fontSize: '20px',
      fontWeight: 'bold',
//      color: hits > 100 ? '#5701d0' : '#999',
      color: "#9f5cfe",
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start'
    });

  return item
    .append(imgDiv)
    .append(labelDiv)
    .append(titleDiv)
    .append(hitsLabelDiv)
    .append(hitsValueDiv);
}

$(document).ready(function () {
  $('#overlay').on('click', function () {
//    $('#suggestBox').empty();
	$('#suggestBox').removeClass('suggestBoxCss').empty();
    $('#overlay').hide();
//    $('#keywordInput').val('');//찾던 키워드가 초기화된다!
  });
});

// 셀 내 키워드 하이라이트 (자동완성 결과용)
function highlightKeywordInCells(keyword) {
  if (!keyword.trim()) return;

  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedKeyword})`, 'gi');

  const titleCells = document.querySelectorAll('#suggestBox .suggest-title');
  titleCells.forEach(cell => {
    const originalText = cell.textContent;
    const highlightedText = originalText.replace(regex, '<span style="background-color: #9f5cfe; color: white; font-weight: bold;">$1</span>');
    cell.innerHTML = highlightedText;
  });
}

$(document).on('keydown', function (e) {
//  if (!$('#keywordInput').is(':focus')) return;
	if (!$('#keywordInput').is(':focus') || !$('#overlay').is(':visible')) return;

  const items = $('.suggestItem');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    selectedIndex = (selectedIndex + 1) % items.length;
  } else if (e.key === 'ArrowUp') {
    selectedIndex = (selectedIndex - 1 + items.length) % items.length;
  } else if (e.key === 'Enter' && selectedIndex >= 0) {
    items.eq(selectedIndex).click();
    return;
  }

  items.removeClass('hovered');
  items.eq(selectedIndex).addClass('hovered');
  items.eq(selectedIndex)[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

