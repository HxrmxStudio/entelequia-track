class Import < ApplicationRecord
    enum :status, { pending: "pending", dry_run: "dry_run", committed: "committed", failed: "failed" }
    validates :source, presence: true
  end