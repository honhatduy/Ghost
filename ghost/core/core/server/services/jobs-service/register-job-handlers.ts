import errors from '@tryghost/errors';
import { JobsService } from './jobs-service';
import CleanTokensJob from '../members/jobs/clean-tokens-job';
import cleanTokens from '../members/jobs/clean-tokens-task';
import * as gifts from '../gifts';
import CleanGiftsJob from '../gifts/jobs/clean-gifts-job';
import ExternalMediaInliner from '../media-inliner/external-media-inliner';
import ExternalMediaInlinerJob from '../media-inliner/external-media-inliner-job';
import type MentionController from '../mentions/mention-controller';
import ProcessWebmentionJob from '../mentions/process-webmention-job';

interface RegisterJobHandlersDependencies {
  jobsService: JobsService;
  db: typeof import('../../data/db');
  logging: typeof import('@tryghost/logging');
  mediaInliner: ExternalMediaInliner;
  mentionsController: MentionController;
}

export default function registerJobHandlers({
  jobsService,
  db,
  logging,
  mediaInliner,
  mentionsController,
}: RegisterJobHandlersDependencies): void {
  jobsService.handle(CleanTokensJob, async () => {
    await cleanTokens({ db, logging });
  });

  jobsService.handle(CleanGiftsJob, async () => {
    if (!gifts.service) {
      throw new errors.IncorrectUsageError({
        message: 'clean-gifts ran before the gifts service was initialised',
      });
    }
    await gifts.service.cleanup();
  });

  jobsService.handle(ExternalMediaInlinerJob, async (job) => {
    await mediaInliner.inline(job.domains);
  });

  jobsService.handle(ProcessWebmentionJob, async (job) => {
    await mentionsController.processWebmention(job);
  });
}
