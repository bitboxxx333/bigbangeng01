import React, { useState } from 'react';
import { X, Sparkles, School, Check, HelpCircle, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

interface CustomDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    schoolName: string;
    grade: string;
    concerns: string[];
    directInput: string;
  }) => void;
  initialSchool?: string;
  initialGrade?: string;
}

const COMMON_WEAKNESS_TAGS = [
  '서술형 조건 영작 감점',
  '어법·문법 개념 취약 (관계사/분사 등)',
  '수능·내신 어휘량(단어 암기) 부족',
  '시험 독해 시간 부족 (속독 불가)',
  '모의고사 킬러 빈칸/순서 추론 취약',
  '교과서·부교재 변형 지문 대처 어려움',
  '듣기 평가 및 기본 발음/연음 취약',
  '어법상 어색한 것 모두 고르기 실패',
];

const GRADE_OPTIONS = [
  '초등 5~6학년',
  '중1',
  '중2',
  '중3',
  '2027 예비고1 (현 중3)',
  '고1',
  '고2',
  '고3',
];

const QUICK_SCHOOL_SUGGESTIONS = [
  '신명여고',
  '인제고',
  '만수고',
  '만수북중',
  '만수여중',
  '간석여중',
  '정각중',
  '만수중',
  '남동중',
  '조동초',
];

export const CustomDiagnosisModal: React.FC<CustomDiagnosisModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialSchool = '',
  initialGrade = '고1',
}) => {
  if (!isOpen) return null;

  const [schoolName, setSchoolName] = useState(initialSchool);
  const [grade, setGrade] = useState(initialGrade);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([COMMON_WEAKNESS_TAGS[0]]);
  const [directInput, setDirectInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const toggleConcern = (tag: string) => {
    if (selectedConcerns.includes(tag)) {
      setSelectedConcerns(selectedConcerns.filter((t) => t !== tag));
    } else {
      setSelectedConcerns([...selectedConcerns, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      setErrorMessage('재학 중인 학교명을 입력해 주세요 (예: 신명여고, 인제고 등)');
      return;
    }
    if (selectedConcerns.length === 0 && !directInput.trim()) {
      setErrorMessage('부족한 부분(취약점 태그 선택 또는 직접 입력)을 하나 이상 작성해 주세요.');
      return;
    }

    setErrorMessage('');
    onSubmit({
      schoolName: schoolName.trim(),
      grade,
      concerns: selectedConcerns,
      directInput: directInput.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border-2 border-[#122B49] max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#122B49] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C59750]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                기타 학교 &amp; 학년 맞춤 진단 입력
              </h3>
              <p className="text-[11px] text-slate-300">
                학교명, 학년, 부족한 부분을 직접 입력하시면 AI가 맞춤 솔루션을 안내합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. School Input */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-900 text-xs sm:text-sm">
              1. 재학 학교명 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <School className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="학교명을 직접 입력해 주세요 (예: 신명여고, 인제고, 조동초 등)"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#122B49] bg-white font-medium"
              />
            </div>
            {/* Quick School Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-semibold mr-1">빠른 선택:</span>
              {QUICK_SCHOOL_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSchoolName(s)}
                  className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 transition cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Grade Selection */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-900 text-xs sm:text-sm">
              2. 현재 학년 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {GRADE_OPTIONS.map((g) => {
                const isSelected = grade === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#122B49] text-white border-[#122B49] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Deficiency / Weakness Areas (Clickable Tags) */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-900 text-xs sm:text-sm">
              3. 현재 가장 부족한 부분 (복수 선택 가능) <span className="text-red-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500">
              시험을 보거나 공부할 때 가장 점수를 깎아먹는 영역을 클릭해 주세요.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_WEAKNESS_TAGS.map((tag) => {
                const isChecked = selectedConcerns.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleConcern(tag)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                      isChecked
                        ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-2xs font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                        isChecked ? 'bg-[#C59750] text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Direct Freeform Input for Custom Weakness */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-900 text-xs sm:text-sm">
              4. 부족한 부분 직접 상세 입력 (선택)
            </label>
            <textarea
              rows={3}
              placeholder="예: 어법에서 관계대명사와 분사구문 문제가 나오면 항상 헷갈려서 점수가 깎여요. 서술형 영작 조건을 맞추는 요령이 부족해서 시험 때마다 10점 이상 감점됩니다."
              value={directInput}
              onChange={(e) => setDirectInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#122B49] bg-white font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#C59750] hover:bg-[#b8893f] text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>맞춤 진단 받기</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
