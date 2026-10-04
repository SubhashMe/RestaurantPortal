import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const UI_LOAD_MORE_COMPONENTS = [
  // 1. Menu Grid
  {
    target: "              </div>\\n            )}\\n          </div>\\n        </section>\\n      </main>\\n    }",
    replacement: \`              </div>
            )}
            
            {filteredMenuItems.length >= menuLimit && (
              <div className="flex justify-center mt-8 pb-4">
                <button onClick={() => setMenuLimit(prev => prev + 12)} className="px-6 py-2 bg-[#2c3038] hover:bg-[#363b45] text-amber-400 rounded-full font-medium transition-colors border border-[#363b45]">
                  Load More Items
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    }\`
  },
  // 2. Admin Orders Table
  {
    target: "                    </tbody>\\n                  </table>\\n                </div>\\n              </div>\\n            </div>\\n          </div>\\n        )\\n      }\\n\\n      // Bookings",
    replacement: \`                    </tbody>
                  </table>
                </div>
                {adminOrders.length >= adminOrdersLimit && (
                  <div className="p-4 border-t border-[#2c3038] flex justify-center">
                    <button onClick={() => setAdminOrdersLimit(prev => prev + 10)} className="px-5 py-1.5 text-sm font-medium bg-[#2c3038] hover:bg-[#363b45] text-amber-400 rounded-full transition-colors">
                      Load More
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      // Bookings\`
  },
  // 3. Admin Bookings Table
  {
    target: "                    </tbody>\\n                  </table>\\n                </div>\\n              </div>\\n            </div>\\n          </div>\\n        )\\n      }\\n\\n      // Inquiries",
    replacement: \`                    </tbody>
                  </table>
                </div>
                {tableBookings.length >= bookingsLimit && (
                  <div className="p-4 border-t border-[#2c3038] flex justify-center">
                    <button onClick={() => setBookingsLimit(prev => prev + 10)} className="px-5 py-1.5 text-sm font-medium bg-[#2c3038] hover:bg-[#363b45] text-amber-400 rounded-full transition-colors">
                      Load More
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      // Inquiries\`
  },
  // 4. Admin Inquiries Table
  {
    target: "                    </tbody>\\n                  </table>\\n                </div>\\n              </div>\\n            </div>\\n          </div>\\n        )\\n      }\\n\\n      // My Orders",
    replacement: \`                    </tbody>
                  </table>
                </div>
                {contactInquiries.length >= inquiriesLimit && (
                  <div className="p-4 border-t border-[#2c3038] flex justify-center">
                    <button onClick={() => setInquiriesLimit(prev => prev + 10)} className="px-5 py-1.5 text-sm font-medium bg-[#2c3038] hover:bg-[#363b45] text-amber-400 rounded-full transition-colors">
                      Load More
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      // My Orders\`
  },
  // 5. My Orders
  {
    target: "                    </div>\\n                  </div>\\n                ))}\\n              </div>\\n            )}\\n          </div>\\n        )\\n      }\\n\\n      // Profile",
    replacement: \`                    </div>
                  </div>
                ))}
              </div>
            )}
            {customerOrders.length >= customerOrdersLimit && (
              <div className="flex justify-center mt-6">
                <button onClick={() => setCustomerOrdersLimit(prev => prev + 10)} className="px-6 py-2 bg-[#2c3038] hover:bg-[#363b45] text-amber-400 rounded-full font-medium transition-colors border border-[#363b45]">
                  Load More Orders
                </button>
              </div>
            )}
          </div>
        )
      }

      // Profile\`
  }
];

UI_LOAD_MORE_COMPONENTS.forEach(component => {
  // Regex to match ignoring small whitespace differences
  const targetRegex = new RegExp(component.target.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&').replace(/\\\\n/g, '\\\\s+'), "g");
  if (targetRegex.test(content)) {
    content = content.replace(targetRegex, component.replacement);
  } else {
    console.log("Could not find target for:", component.target.slice(0, 50));
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log("Added Load More buttons to UI");
