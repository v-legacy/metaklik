import { LinkRepository, CreateLinkInput } from "../repositories/link.repository";

export class LinkService {
  private linkRepository: LinkRepository;

  constructor() {
    this.linkRepository = new LinkRepository();
  }

  async createLink(data: CreateLinkInput) {
    // Here you can add business logic (e.g. scrape metadata using your services)
    // For MVP, we just save it directly
    return this.linkRepository.createLink(data);
  }

  async getUserLinks(userId: string) {
    return this.linkRepository.getLinksByUserId(userId);
  }
}
