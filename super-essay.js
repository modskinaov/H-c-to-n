// Super Essay Management System
class SuperEssayManager {
    constructor() {
        this.timeLimit = 30 * 60; // 30 phút = 1800 giây
        this.minLines = 10;
        this.currentTime = this.timeLimit;
        this.timerInterval = null;
        this.isActive = false;
        this.hasExited = false;
        
        // Câu hỏi siêu tự luận
        this.superQuestion = {
            id: 'super_001',
            type: 'super-essay',
            category: 'Siêu Tự Luận',
            title: 'Bài 9: Tính toán quãng đường và thời gian',
            question: `Một người đang ở trên tầng thượng của một tòa nhà quan sát con đường chạy thẳng đến chân tòa nhà. 
Anh ta nhìn thấy một người điều khiển chiếc xe máy đi về phía tòa nhà với phương nhìn tạo với phương nằm ngang một góc bằng 30°. 
Sau 6 phút, người quan sát vẫn nhìn thấy người điều khiển chiếc xe máy với phương nhìn tạo với phương nằm ngang một góc bằng 60°. 
Hỏi sau bao nhiêu phút nữa thì xe máy sẽ chạy đến chân tòa nhà? Cho biết vận tốc xe máy không đổi.`,
            imageUrl: 'data:image/png;base64,...', // Bạn cần convert ảnh thành base64
            correctKeywords: ['AB', 'CD', 'tan', '30', '60', 'vận tốc', '3 phút'],
            explanation: `
**Lời giải chi tiết:**

**Bước 1:** Tính khoảng cách từ xe đến chân tòa nhà

Tại C (góc nhìn 30°):
- tan 30° = AB/AC
- AC = AB/(tan 30°) = AB√3

Tại D (góc nhìn 60°):
- tan 60° = AB/AD
- AD = AB/(tan 60°) = AB/√3

**Bước 2:** Quãng đường xe đi trong 6 phút
CD = AC - AD = AB√3 - AB/√3 = (3AB - AB)/√3 = 2AB/√3

**Bước 3:** Vận tốc xe
v = CD/6 = (2AB/√3)/6 = AB/(3√3)

**Bước 4:** Thời gian xe đi từ D đến chân tòa nhà
t = AD/v = (AB/√3)/(AB/(3√3)) = 3 phút

**Đáp án: 3 phút**
            `
        };
    }

    start() {
        this.isActive = true;
        this.hasExited = false;
        this.currentTime = this.timeLimit;
        this.startTimer();
        this.setupExitDetection();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.currentTime--;
            this.updateTimerDisplay();
            
            if (this.currentTime <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerElement = document.getElementById('superTimer');
        if (timerElement) {
            timerElement.textContent = display;
            
            // Cảnh báo khi còn 5 phút
            if (this.currentTime <= 300) {
                timerElement.classList.add('timer-warning');
            }
        }
    }

    timeUp() {
        this.stop();
        alert('⏰ Hết giờ! Bài làm của bạn sẽ được nộp tự động.');
        submitSuperEssay(true);
    }

    stop() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.isActive = false;
    }

    setupExitDetection() {
        // Phát hiện khi người dùng rời khỏi trang
        const handleBeforeUnload = (e) => {
            if (this.isActive) {
                e.preventDefault();
                e.returnValue = '';
                this.hasExited = true;
            }
        };

        // Phát hiện khi người dùng chuyển tab
        const handleVisibilityChange = () => {
            if (document.hidden && this.isActive) {
                this.showExitWarning();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Lưu để có thể remove sau
        this.cleanupFunctions = () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }

    showExitWarning() {
        if (confirm('⚠️ CẢNH BÁO: Nếu bạn thoát ra, bạn sẽ BỊ LOẠI và mất quyền làm bài Siêu Tự Luận này!\n\nBạn có chắc muốn thoát?')) {
            this.disqualify();
        }
    }

    disqualify() {
        this.stop();
        this.hasExited = true;
        
        if (this.cleanupFunctions) {
            this.cleanupFunctions();
        }
        
        alert('❌ Bạn đã bị LOẠI khỏi bài Siêu Tự Luận!');
        goHome();
    }

    countLines(text) {
        if (!text.trim()) return 0;
        return text.split('\n').filter(line => line.trim().length > 0).length;
    }

    checkAnswer(answer) {
        const lines = this.countLines(answer);
        
        if (lines < this.minLines) {
            return {
                success: false,
                reason: 'insufficient_lines',
                lines: lines,
                message: `Bài làm phải có ít nhất ${this.minLines} dòng. Bạn chỉ có ${lines} dòng.`
            };
        }

        // Kiểm tra từ khóa quan trọng
        const lowerAnswer = answer.toLowerCase();
        let keywordCount = 0;
        
        for (let keyword of this.superQuestion.correctKeywords) {
            if (lowerAnswer.includes(keyword.toLowerCase())) {
                keywordCount++;
            }
        }

        // Cần ít nhất 60% từ khóa đúng
        const requiredKeywords = Math.ceil(this.superQuestion.correctKeywords.length * 0.6);
        
        if (keywordCount >= requiredKeywords) {
            return {
                success: true,
                keywordScore: keywordCount,
                totalKeywords: this.superQuestion.correctKeywords.length,
                lines: lines
            };
        }

        return {
            success: false,
            reason: 'insufficient_keywords',
            keywordScore: keywordCount,
            totalKeywords: this.superQuestion.correctKeywords.length,
            message: `Bài làm cần chứa nhiều từ khóa quan trọng hơn. Bạn có ${keywordCount}/${this.superQuestion.correctKeywords.length} từ khóa.`
        };
    }

    cleanup() {
        this.stop();
        if (this.cleanupFunctions) {
            this.cleanupFunctions();
        }
    }
}

// Instance toàn cục
let superEssayManager = null;

// Hàm khởi tạo Siêu Tự Luận
function startSuperEssay() {
    if (superEssayManager) {
        superEssayManager.cleanup();
    }
    
    superEssayManager = new SuperEssayManager();
    
    const question = superEssayManager.superQuestion;
    
    document.getElementById('questionCategory').textContent = question.category;
    document.getElementById('questionType').innerHTML = '🌟 SIÊU TỰ LUẬN';
    document.getElementById('questionText').innerHTML = `
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="color: #fbbf24; margin-bottom: 15px;">${question.title}</h3>
            <div style="line-height: 1.8;">${question.question}</div>
        </div>
    `;
    
    document.getElementById('multipleChoiceContainer').classList.add('hidden');
    document.getElementById('essayContainer').classList.add('hidden');
    
    const container = document.createElement('div');
    container.id = 'superEssayContainer';
    container.className = 'super-essay-container';
    container.innerHTML = `
        <div class="super-timer">
            <div>
                <span style="color: white; font-size: 1.2em;">⏱️ Thời gian còn lại:</span>
            </div>
            <div class="timer-display" id="superTimer">30:00</div>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" 
                 alt="Đề bài" class="question-image" id="questionImage" style="display: none;">
        </div>
        
        <div class="line-counter" id="lineCounter">
            📝 Số dòng: 0 / ${superEssayManager.minLines} (tối thiểu)
        </div>
        
        <textarea class="super-essay-input" id="superEssayInput" 
                  placeholder="Viết lời giải chi tiết của bạn tại đây...

⚠️ LƯU Ý QUAN TRỌNG:
- Thời gian làm bài: 30 phút
- Bài làm phải có ít nhất ${superEssayManager.minLines} dòng
- KHÔNG được thoát ra trong lúc làm bài (sẽ bị LOẠI)
- Phần thưởng: 10,000 điểm + 10,000 EXP + Danh hiệu 'Xuất Sắc'

Bắt đầu viết..."></textarea>
        
        <button class="btn btn-primary" onclick="submitSuperEssay(false)" style="margin-bottom: 10px;">
            ✓ Nộp Bài Siêu Tự Luận
        </button>
        
        <div style="color: rgba(255,255,255,0.8); text-align: center; margin-top: 10px;">
            ⚠️ Lưu ý: Một khi đã nộp bài, bạn không thể sửa đổi!
        </div>
    `;
    
    const resultBox = document.getElementById('resultBox');
    const nextBtn = document.getElementById('nextBtn');
    resultBox.parentNode.insertBefore(container, resultBox);
    
    // Cập nhật số dòng khi nhập
    document.getElementById('superEssayInput').addEventListener('input', (e) => {
        const lines = superEssayManager.countLines(e.target.value);
        const counter = document.getElementById('lineCounter');
        counter.textContent = `📝 Số dòng: ${lines} / ${superEssayManager.minLines} (tối thiểu)`;
        
        if (lines >= superEssayManager.minLines) {
            counter.classList.remove('invalid');
        } else {
            counter.classList.add('invalid');
        }
    });
    
    superEssayManager.start();
    
    document.getElementById('resultBox').classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');
}

// Hàm nộp bài
function submitSuperEssay(autoSubmit = false) {
    if (!superEssayManager || !superEssayManager.isActive) {
        alert('Không có bài Siêu Tự Luận đang hoạt động!');
        return;
    }
    
    const answer = document.getElementById('superEssayInput').value.trim();
    
    if (!answer && !autoSubmit) {
        alert('Vui lòng viết bài làm của bạn!');
        return;
    }
    
    if (!autoSubmit && !confirm('⚠️ Bạn có chắc muốn nộp bài? Sau khi nộp sẽ không thể sửa đổi!')) {
        return;
    }
    
    superEssayManager.stop();
    
    const result = superEssayManager.checkAnswer(answer);
    const resultBox = document.getElementById('resultBox');
    
    if (result.success) {
        // THÀNH CÔNG - Tặng thưởng khủng
        currentPlayer.score += 10000;
        currentPlayer.correct++;
        currentPlayer.exp = (currentPlayer.exp || 0) + 10000;
        currentPlayer.level = calculateLevel(currentPlayer.exp);
        
        // Thêm danh hiệu Xuất Sắc
        if (!currentPlayer.achievements) currentPlayer.achievements = [];
        if (!currentPlayer.achievements.includes('super_excellence')) {
            currentPlayer.achievements.push('super_excellence');
        }
        
        playAchievementSound();
        
        resultBox.className = 'result-box correct';
        resultBox.innerHTML = `
            <div class="result-title">🎉 XUẤT SẮC! HOÀN HẢO!</div>
            <div class="excellence-badge">⭐ DANH HIỆU: XUẤT SẮC ⭐</div>
            <div class="result-explanation" style="margin-top: 20px;">
                <strong>🏆 PHẦN THƯỞNG:</strong><br>
                ✅ +10,000 điểm<br>
                ✅ +10,000 kinh nghiệm<br>
                ✅ Danh hiệu "Xuất Sắc"<br><br>
                
                <strong>📊 ĐÁNH GIÁ BÀI LÀM:</strong><br>
                📝 Số dòng: ${result.lines} dòng (✓ Đạt yêu cầu)<br>
                🎯 Từ khóa: ${result.keywordScore}/${result.totalKeywords}<br><br>
                
                ${superEssayManager.superQuestion.explanation}
            </div>
        `;
        
        showAchievement('🌟 XUẤT SẮC!', 'Bạn đã hoàn thành Siêu Tự Luận!');
        
    } else {
        // KHÔNG ĐẠT
        resultBox.className = 'result-box incorrect';
        resultBox.innerHTML = `
            <div class="result-title">❌ Chưa đạt yêu cầu</div>
            <div class="result-explanation">
                <strong>Lý do:</strong><br>
                ${result.message}<br><br>
                
                ${result.lines ? `📝 Số dòng của bạn: ${result.lines} dòng<br>` : ''}
                ${result.keywordScore !== undefined ? `🎯 Từ khóa: ${result.keywordScore}/${result.totalKeywords}<br>` : ''}
                <br>
                <strong>💡 GỢI Ý:</strong><br>
                - Viết chi tiết hơn, giải thích từng bước<br>
                - Sử dụng các công thức và tính toán cụ thể<br>
                - Đảm bảo có đủ ${superEssayManager.minLines} dòng trở lên<br><br>
                
                ${superEssayManager.superQuestion.explanation}
            </div>
        `;
    }
    
    currentPlayer.total++;
    currentPlayer.bestStreak = Math.max(currentPlayer.bestStreak || 0, streak);
    checkAchievements();
    savePlayers();
    updateScore();
    updateLevelDisplay();
    
    resultBox.classList.remove('hidden');
    document.getElementById('nextBtn').classList.remove('hidden');
    
    // Xóa container siêu tự luận
    const container = document.getElementById('superEssayContainer');
    if (container) {
        container.remove();
    }
    
    superEssayManager.cleanup();
}

// Thêm achievement mới
achievements.push({
    id: 'super_excellence',
    icon: '🌟',
    name: 'Xuất Sắc',
    desc: 'Hoàn thành Siêu Tự Luận',
    condition: (p) => (p.achievements || []).includes('super_excellence')
});