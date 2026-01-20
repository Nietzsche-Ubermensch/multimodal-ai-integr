import { type SearchResultInterface } from '../globalSearch/globalSearchInterface'

export const DB_METADATA_TAG_PLATFORM_API = 'api'

export class ReferenceManagementApiModel implements SearchResultInterface {
  public title?: string
  public href?: string
  public content?: string

  constructor({ title, href, content }: { title?: string; href?: string; content?: string }) {
    this.title = title
    this.href = href
    this.content = content
  }
}
