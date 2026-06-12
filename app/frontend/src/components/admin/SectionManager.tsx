import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useEditMode } from '@/contexts/EditModeContext';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

function getSectionStorageKey(): string {
  return `custom-sections-${window.location.pathname}`;
}

function getDeletedSectionsKey(): string {
  return `deleted-sections-${window.location.pathname}`;
}

export default function SectionManager() {
  const { isEditMode } = useEditMode();
  const [sections, setSections] = useState<HTMLElement[]>([]);
  const [, setForceUpdate] = useState(0);

  // Find all major sections on the page
  const findSections = useCallback(() => {
    const main = document.querySelector('main');
    if (!main) return [];
    const contentDiv = main.querySelector('.relative.z-10');
    if (!contentDiv) return [];
    
    const sectionElements: HTMLElement[] = [];
    contentDiv.querySelectorAll('section, [class*="py-"], [class*="min-h-"]').forEach((el) => {
      const htmlEl = el as HTMLElement;
      // Only top-level sections (direct children or one level deep)
      if (htmlEl.parentElement === contentDiv || htmlEl.parentElement?.parentElement === contentDiv) {
        if (htmlEl.offsetHeight > 100) {
          sectionElements.push(htmlEl);
        }
      }
    });
    return sectionElements;
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      setSections([]);
      return;
    }
    
    const timer = setTimeout(() => {
      setSections(findSections());
    }, 300);

    return () => clearTimeout(timer);
  }, [isEditMode, findSections]);

  // Apply deleted sections on load
  useEffect(() => {
    const deletedKey = getDeletedSectionsKey();
    const deleted = JSON.parse(localStorage.getItem(deletedKey) || '[]') as number[];
    if (deleted.length > 0) {
      const allSections = findSections();
      deleted.forEach((idx) => {
        if (allSections[idx]) {
          allSections[idx].style.display = 'none';
        }
      });
    }
  }, [findSections]);

  // Apply custom sections on load
  useEffect(() => {
    const customKey = getSectionStorageKey();
    const customSections = JSON.parse(localStorage.getItem(customKey) || '[]') as { afterIndex: number; html: string }[];
    
    if (customSections.length > 0) {
      const allSections = findSections();
      customSections.forEach((cs) => {
        if (allSections[cs.afterIndex]) {
          const existing = document.querySelector(`[data-custom-section="${cs.afterIndex}"]`);
          if (!existing) {
            const div = document.createElement('div');
            div.setAttribute('data-custom-section', String(cs.afterIndex));
            div.innerHTML = cs.html;
            allSections[cs.afterIndex].insertAdjacentElement('afterend', div);
          }
        }
      });
    }
  }, [findSections]);

  const handleAddSection = (afterIndex: number) => {
    const allSections = findSections();
    if (!allSections[afterIndex]) return;

    const newSection = document.createElement('section');
    newSection.className = 'py-16 px-4 bg-gray-50 dark:bg-[#6B6B6B]';
    newSection.setAttribute('data-custom-section', String(afterIndex));
    newSection.innerHTML = `
      <div class="container mx-auto text-center">
        <h2 class="text-3xl font-bold mb-4 text-gray-800 dark:text-white">قسم جديد</h2>
        <p class="text-gray-600 dark:text-gray-300">انقر على النص لتعديله</p>
      </div>
    `;
    allSections[afterIndex].insertAdjacentElement('afterend', newSection);

    // Save to localStorage
    const customKey = getSectionStorageKey();
    const customSections = JSON.parse(localStorage.getItem(customKey) || '[]') as { afterIndex: number; html: string }[];
    customSections.push({ afterIndex, html: newSection.innerHTML });
    localStorage.setItem(customKey, JSON.stringify(customSections));

    setSections(findSections());
    setForceUpdate((v) => v + 1);
    toast.success('تم إضافة قسم جديد');
  };

  const handleDeleteSection = (index: number) => {
    const allSections = findSections();
    if (!allSections[index]) return;

    allSections[index].style.display = 'none';

    // Save deleted index to localStorage
    const deletedKey = getDeletedSectionsKey();
    const deleted = JSON.parse(localStorage.getItem(deletedKey) || '[]') as number[];
    if (!deleted.includes(index)) {
      deleted.push(index);
      localStorage.setItem(deletedKey, JSON.stringify(deleted));
    }

    setSections(findSections());
    setForceUpdate((v) => v + 1);
    toast.success('تم حذف القسم');
  };

  if (!isEditMode || sections.length === 0) return null;

  return createPortal(
    <div data-edit-overlay="true" style={{ pointerEvents: 'none' }}>
      {sections.map((section, idx) => {
        if (section.style.display === 'none') return null;
        const rect = section.getBoundingClientRect();
        const scrollTop = window.scrollY;

        return (
          <div key={`section-controls-${idx}`}>
            {/* Delete button on top-right of section */}
            <button
              onClick={() => handleDeleteSection(idx)}
              className="fixed z-[9998] w-7 h-7 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
              style={{
                top: `${rect.top + scrollTop + 8}px`,
                left: `${rect.left + 8}px`,
                pointerEvents: 'auto',
                position: 'absolute',
              }}
              title="حذف القسم"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>

            {/* Add button between sections */}
            <button
              onClick={() => handleAddSection(idx)}
              className="fixed z-[9998] flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#D3B051]/90 text-[#1a1a2e] text-xs font-bold hover:bg-[#D3B051] transition-colors shadow-lg"
              style={{
                top: `${rect.bottom + scrollTop - 4}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                pointerEvents: 'auto',
                position: 'absolute',
              }}
              title="إضافة قسم"
            >
              <Plus className="h-3.5 w-3.5" />
              إضافة قسم
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}