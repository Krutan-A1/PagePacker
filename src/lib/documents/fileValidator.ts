import type { DocumentSourceType } from '@/types/imposition'

export type FileValidationError = 'doc' | 'unsupported' | 'empty'

export interface ValidatedFile {
  file: File
  type: DocumentSourceType
}

export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : ''
}

export function validateFile(file: File): ValidatedFile | FileValidationError {
  if (file.size === 0) return 'empty'

  const ext = getFileExtension(file.name)

  if (ext === 'doc') return 'doc'

  if (ext === 'pdf' || file.type === 'application/pdf') {
    return { file, type: 'pdf' }
  }

  if (
    ext === 'docx' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return { file, type: 'docx' }
  }

  return 'unsupported'
}

export const VALIDATION_MESSAGES: Record<FileValidationError, string> = {
  doc: 'Legacy .doc is not supported — please save as .docx or export to PDF.',
  unsupported: 'Unsupported file type. Please upload a PDF or DOCX file.',
  empty: 'The selected file is empty.',
}
