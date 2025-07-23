  let currentPage = 1;
        const limit = 5; // 그리드 형태로 3x3 배치
        let allCourses = []; // 전체 강의 데이터
        let filteredCourses = []; // 필터링된 강의 데이터

        // 페이지 로드시 강의 목록 불러오기
        window.addEventListener("DOMContentLoaded", () => {
            loadCourses(1);
        });

        // 수강 중인 강의 목록 로드
        async function loadCourses(page = 1) {
        	currentPage = page;
            try {
                const response = await axios.get(`/user/showUserCourses?page=${page}&limit=${limit}`);
                allCourses = response.data.courses;
                const userCourseList = response.data.userCourseList;
                const totalCount = response.data.totalCount;
                filteredCourses = [...allCourses];
                
                
                renderCourses();
                getPagination(totalCount, page, limit);
                
                if (allCourses.length === 0) {
                    showEmptyState();
                }
            } catch (error) {
                console.error('강의 목록 로드 실패:', error);
                // 데모 데이터로 대체
                loadDemoData();
            }
        }


        // 강의 목록 렌더링
        function renderCourses() {
            const grid = document.getElementById('courseGrid');
            const emptyState = document.getElementById('emptyState');
            
            if (filteredCourses.length === 0) {
                grid.innerHTML = '';
                emptyState.style.display = 'block';
                return;
            }
            
            emptyState.style.display = 'none';
            
            const startIndex = (currentPage - 1) * limit;
            const endIndex = startIndex + limit;
            const pageData = filteredCourses.slice(startIndex, endIndex);
            
            grid.innerHTML = pageData.map(course => createCourseCard(course)).join('');
        }

        // 강의 카드 생성
        function createCourseCard(course) {
            const progressPercent = course.progress || 0;
            const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDM1MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmN2ZmIi8+CjxjaXJjbGUgY3g9IjE3NSIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IiM0YTkwZTIiLz4KPHN2ZyB4PSIxNTUiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xNSAxMkwyNSAyMEwxNSAyOFYxMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K';
            
            return `
                <div class="course-card">
                    <div class="card-thumbnail">
                        <img src="${course.thumbnailPath || defaultImage}" alt="${course.courseTitle}" 
                             onerror="this.src='${defaultImage}'">
                        <div class="progress-overlay">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <div class="progress-text">${progressPercent}% 완료 (${course.completedLessons || 0}/${course.totalLessons || 0})</div>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="card-badges">
                            <span class="badge badge-category">${course.category}</span>
                            <span class="badge badge-difficulty badge-${course.difficulty}">${course.difficulty}</span>
                        </div>
                        <h3 class="card-title">${course.courseTitle}</h3>
                        <p class="card-description">${course.introduction || '강의 설명이 없습니다.'}</p>
                        <div class="card-stats">
                            <div class="stat-group">
                                <div class="stat-item">
                                    <span>📅</span>
                                    <span>수강시작: ${formatDate(course.enrollDate)}</span>
                                </div>
                                <div class="stat-item">
                                    <span>🕒</span>
                                    <span>최근학습: ${formatDate(course.lastStudied)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-primary" onclick="continueLearning('${course.courseSeq}')">
                                ${progressPercent > 0 ? '학습 계속하기' : '학습 시작'}
                            </button>
                            <button class="btn btn-outline" onclick="viewCourseDetail(${course.courseSeq})">
                                강의 정보
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        // 날짜 포맷 함수
        function formatDate(dateString) {
            if (!dateString) return '-';
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // 월은 0부터 시작함
            const day = date.getDate();
           	
            return `${year}년 ${month}월 ${day}일`;
        }

        // 강의 필터링
//         function filterCourses() {
//             const categoryFilter = document.getElementById('categoryFilter').value;
//             const difficultyFilter = document.getElementById('difficultyFilter').value;
//             const searchInput = document.getElementById('searchInput').value.toLowerCase();
            
//             filteredCourses = allCourses.filter(course => {
//                 const matchCategory = !categoryFilter || course.category === categoryFilter;
//                 const matchDifficulty = !difficultyFilter || course.difficulty === difficultyFilter;
//                 const matchSearch = !searchInput || course.courseTitle.toLowerCase().includes(searchInput);
                
//                 return matchCategory && matchDifficulty && matchSearch;
//             });
            
//             currentPage = 1; // 필터 적용시 첫 페이지로
//             renderCourses();
//             renderPagination();
//         }

        // 페이지네이션 렌더링
    function getPagination(totalCount, currentPage, limit) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(totalCount / limit);
    const maxButtons = 5;

    // 현재 페이지가 포함된 블록 계산
    const currentBlock = Math.floor((currentPage - 1) / maxButtons);
    const startPage = currentBlock * maxButtons + 1;
    const endPage = Math.min(startPage + maxButtons - 1, totalPages);

    // 이전 블록 버튼
    if (startPage > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "<";
        prevBtn.className = "btn btn-sm btn-outline-secondary m-1";
        prevBtn.addEventListener("click", () => {
            loadCourses(startPage - 1);
        });
        pagination.appendChild(prevBtn);
    }

    // 페이지 번호 버튼
    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.className = "btn btn-sm btn-outline-primary m-1";
        btn.textContent = i;

        if (i === currentPage) {
            btn.classList.add("active");
        }

        btn.addEventListener("click", () => {
            loadCourses(i);
        });

        pagination.appendChild(btn);
    }

    // 다음 블록 버튼
    if (endPage < totalPages) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = ">";
        nextBtn.className = "btn btn-sm btn-outline-secondary m-1";
        nextBtn.addEventListener("click", () => {
            loadCourse(endPage + 1);
        });
        pagination.appendChild(nextBtn);
    }
}

        // 페이지 이동
        function goToPage(page) {
            currentPage = page;
            renderCourses();
            renderPagination();
        }

        // 빈 상태 표시
        function showEmptyState() {
            document.getElementById('courseGrid').innerHTML = '';
            document.getElementById('emptyState').style.display = 'block';
        }

        // 학습 계속하기
        function continueLearning(courseSeq) {
            location.href = "/ui/user_lecture?seq="+courseSeq;
        }

        // 강의 상세 정보
        function viewCourseDetail(courseSeq) {
            window.location.href = `/course/detail/${courseSeq}`;
        }

        // 모바일 메뉴 토글
        function toggleMobileMenu() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        // 사이드바 링크 활성화
        document.querySelectorAll('.sidebar a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
                this.classList.add('active');
                
                // 모바일에서 메뉴 클릭 시 사이드바 닫기
                if (window.innerWidth <= 768) {
                    toggleMobileMenu();
                }
            });
        });

        // 윈도우 리사이즈 시 사이드바 상태 초기화
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                document.getElementById('sidebar').classList.remove('active');
                document.querySelector('.mobile-overlay').classList.remove('active');
            }
        });