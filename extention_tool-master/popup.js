// Lưu trữ dữ liệu đã cào
let scrapedData = null;

// Các phần tử DOM
const scrapeBtn = document.getElementById('scrapeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const statusDiv = document.getElementById('status');
const resultDiv = document.getElementById('result');
const titleInfo = document.getElementById('titleInfo');
const questionCount = document.getElementById('questionCount');

// Hiển thị thông báo trạng thái
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.classList.remove('hidden');
}

// Ẩn thông báo trạng thái
function hideStatus() {
  statusDiv.classList.add('hidden');
}

// Hiển thị kết quả
function showResult(data) {
  titleInfo.innerHTML = `<strong>Tiêu đề:</strong> ${document.title || 'Quiz'}`;
  questionCount.innerHTML = `<strong>Số câu hỏi:</strong> ${data.length} câu`;
  resultDiv.classList.remove('hidden');
}

// Xử lý sự kiện click nút cào dữ liệu
scrapeBtn.addEventListener('click', async () => {
  try {
    showStatus('Đang cào dữ liệu...', 'loading');
    scrapeBtn.disabled = true;

    // Lấy tab hiện tại
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Kiểm tra xem có đang ở wayground.com không
    if (!tab.url.includes('wayground.com')) {
      showStatus('Vui lòng mở trang wayground.com trước!', 'error');
      scrapeBtn.disabled = false;
      return;
    }

    // Thực thi content script
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeQuizData
    });

    if (results && results[0] && results[0].result) {
      scrapedData = results[0].result;

      if (scrapedData.length > 0) {
        showStatus('Lấy dữ liệu thành công!', 'success');
        showResult(scrapedData);
        downloadBtn.disabled = false;
      } else {
        showStatus('Không tìm thấy câu hỏi nào!', 'error');
      }
    } else {
      showStatus('Không thể lấy dữ liệu!', 'error');
    }
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error);
    showStatus(`Lỗi: ${error.message}`, 'error');
  } finally {
    scrapeBtn.disabled = false;
  }
});

// Xử lý sự kiện click nút tải xuống
downloadBtn.addEventListener('click', () => {
  if (!scrapedData) {
    showStatus('Chưa có dữ liệu để tải!', 'error');
    return;
  }

  // Sắp xếp lại thứ tự fields đúng format: id, question, options, correctAnswer
  const formattedData = scrapedData.map(item => ({
    id: item.id,
    question: item.question,
    options: item.options,
    correctAnswer: item.correctAnswer
  }));

  // Tạo JSON blob
  const jsonString = JSON.stringify(formattedData, null, 4);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Tạo link tải xuống
  const a = document.createElement('a');
  a.href = url;
  a.download = `quiz_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showStatus('Đã tải file JSON!', 'success');
});

// Hàm content script để cào dữ liệu
function scrapeQuizData() {
  const questions = [];

  // Mảng các ký tự đáp án
  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // Tìm tất cả các khối câu hỏi bằng data-testid="qdc-inner-card-question"
  const questionElements = document.querySelectorAll('[data-testid="qdc-inner-card-question"]');

  let questionId = 1;

  for (const questionEl of questionElements) {
    // Lấy nội dung câu hỏi từ thẻ <p> bên trong
    const questionParagraphs = questionEl.querySelectorAll('p');
    let questionContent = '';

    // Lấy text từ tất cả các thẻ p nested
    for (const p of questionParagraphs) {
      const text = p.textContent.trim();
      if (text) {
        questionContent = text;
        break;
      }
    }

    // Nếu không tìm thấy nội dung câu hỏi, thử lấy từ textContent của element
    if (!questionContent) {
      questionContent = questionEl.textContent.trim();
    }

    // Tìm container cha chứa cả câu hỏi và các options
    let container = questionEl.closest('div');
    let depth = 0;

    // Đi lên DOM để tìm container chứa các div option
    while (container && depth < 15) {
      const options = container.querySelectorAll('[data-testid^="option-"]');
      if (options.length > 0) {
        break;
      }
      container = container.parentElement;
      depth++;
    }

    if (!container) continue;

    const questionObj = {
      id: questionId,
      question: questionContent,
      options: {},
      correctAnswer: ''
    };

    // Tìm các option trong container của câu hỏi
    const optionDivs = container.querySelectorAll('[data-testid^="option-"]');

    let optionIndex = 0;
    for (const optionDiv of optionDivs) {
      if (optionIndex >= optionLabels.length) break;

      const label = optionLabels[optionIndex];

      // Lấy nội dung option từ thẻ <p> bên trong
      const pTag = optionDiv.querySelector('p');
      const optionContent = pTag ? pTag.textContent.trim() : optionDiv.textContent.trim();

      // Thêm vào object options
      questionObj.options[label] = optionContent;

      // Kiểm tra xem đây có phải đáp án đúng không
      // Cấu trúc: icon check và option div là siblings trong cùng một parent container
      // Parent structure: flex container > [div.text-wds-success-600 > i.fas.fa-check-circle] + [div > option-div]
      let isCorrect = false;

      // Đi lên parent để tìm container chứa cả icon check và option
      // optionDiv -> parent (py-0.5 px-0) -> grandparent (flex container)
      let parent = optionDiv.parentElement;
      if (parent) {
        let grandParent = parent.parentElement;
        if (grandParent) {
          // Tìm div.text-wds-success-600 chứa i.fas.fa-check-circle trong grandParent
          const successDiv = grandParent.querySelector('.text-wds-success-600 i.fas.fa-check-circle');
          if (successDiv) {
            isCorrect = true;
          }
        }
      }

      // Fallback: Tìm trực tiếp trong optionDiv
      if (!isCorrect) {
        const checkIcon = optionDiv.querySelector('i.fas.fa-check-circle');
        if (checkIcon) {
          isCorrect = true;
        }
      }

      if (isCorrect) {
        questionObj.correctAnswer = label;
      }

      optionIndex++;
    }

    // Chỉ thêm câu hỏi nếu có options
    if (Object.keys(questionObj.options).length > 0) {
      questions.push(questionObj);
      questionId++;
    }
  }

  // Nếu không tìm thấy câu hỏi bằng cách trên, thử cách cũ với số thứ tự
  if (questions.length === 0) {
    const allParagraphs = document.querySelectorAll('p');
    const questionMap = new Map();

    for (const p of allParagraphs) {
      const text = p.textContent.trim();
      const match = text.match(/^(\d+)\.\s*/);
      if (match) {
        const questionNum = parseInt(match[1], 10);
        const questionContent = text.substring(match[0].length).trim();

        let container = p.closest('div');
        let depth = 0;

        while (container && depth < 10) {
          const options = container.querySelectorAll('[data-testid^="option-"]');
          if (options.length > 0) {
            break;
          }
          container = container.parentElement;
          depth++;
        }

        if (container) {
          questionMap.set(questionNum, {
            element: p,
            container: container,
            content: questionContent
          });
        }
      }
    }

    for (const [num, questionInfo] of questionMap) {
      const questionObj = {
        id: num,
        question: questionInfo.content || '',
        options: {},
        correctAnswer: ''
      };

      const optionDivs = questionInfo.container.querySelectorAll('[data-testid^="option-"]');

      let optionIndex = 0;
      for (const optionDiv of optionDivs) {
        if (optionIndex >= optionLabels.length) break;

        const label = optionLabels[optionIndex];
        const pTag = optionDiv.querySelector('p');
        const optionContent = pTag ? pTag.textContent.trim() : optionDiv.textContent.trim();

        questionObj.options[label] = optionContent;

        const checkIcon = optionDiv.querySelector('i.fa-check-circle, i.fas.fa-check-circle, .fa-check-circle');
        if (checkIcon) {
          questionObj.correctAnswer = label;
        }

        optionIndex++;
      }

      if (Object.keys(questionObj.options).length > 0) {
        questions.push(questionObj);
      }
    }

    questions.sort((a, b) => a.id - b.id);
  }

  return questions;
}
