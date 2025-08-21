class Import < ApplicationRecord
  enum :status, { 
    pending: "pending", 
    dry_run: "dry_run", 
    completed: "completed", 
    failed: "failed" 
  }
  
  validates :source, presence: true
end